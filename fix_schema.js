const fs = require('fs');
const { execSync } = require('child_process');

function toCamelCase(str) {
    return str.charAt(0).toLowerCase() + str.slice(1);
}

function pluralize(str) {
    if (str.endsWith('y')) return str.slice(0, -1) + 'ies';
    if (str.endsWith('s')) return str + 'es';
    return str + 's';
}

function run() {
    let schema = fs.readFileSync('enhanced-schema.prisma', 'utf8');
    let hasChanges = false;
    let iteration = 0;

    while (iteration < 10) {
        iteration++;
        console.log(`\nIteration ${iteration}`);
        try {
            execSync('npx prisma validate --schema=enhanced-schema.prisma', { encoding: 'utf8', stdio: 'pipe' });
            console.log("Validation passed!");
            break;
        } catch (e) {
            const output = e.stderr || e.stdout || e.message;
            // console.log("Errors found, analyzing...");
            
            // error: Error validating field `warehouse` in model `SalesOrder`: The relation field `warehouse` on model `SalesOrder` is missing an opposite relation field on the model `Warehouse`.
            const regex = /The relation field `([^`]+)` on model `([^`]+)` is missing an opposite relation field on the model `([^`]+)`/g;
            let match;
            const fixes = {};
            let matchCount = 0;

            while ((match = regex.exec(output)) !== null) {
                matchCount++;
                const sourceField = match[1];
                const sourceModel = match[2];
                const targetModel = match[3];

                const backRelationField = pluralize(toCamelCase(sourceModel));
                const backRelationType = `${sourceModel}[]`;
                const newLine = `  ${backRelationField} ${backRelationType}`;

                if (!fixes[targetModel]) fixes[targetModel] = [];
                // Check if already added to fixes
                if (!fixes[targetModel].includes(newLine)) {
                     fixes[targetModel].push(newLine);
                }
            }

            if (matchCount === 0) {
                console.log("Could not parse errors or other error types found.");
                console.log(output.substring(0, 500));
                break;
            }

            console.log(`Found ${matchCount} missing relations to fix.`);

            // Apply fixes
            let lines = schema.split('\n');
            for (const [targetModel, newFields] of Object.entries(fixes)) {
                // Find model definition
                const modelStartRegex = new RegExp(`^model\\s+${targetModel}\\s*\\{`);
                let inModel = false;
                for (let i = 0; i < lines.length; i++) {
                    if (modelStartRegex.test(lines[i])) {
                        inModel = true;
                        continue;
                    }
                    if (inModel && lines[i].trim() === '}') {
                        // Insert fields before closing brace
                        for (const field of newFields) {
                            lines.splice(i, 0, field);
                            i++;
                            hasChanges = true;
                        }
                        break;
                    }
                }
            }
            
            schema = lines.join('\n');
            fs.writeFileSync('enhanced-schema.prisma', schema);
            console.log(`Applied fixes and saved schema. Run prisma format next.`);
        }
    }
}

run();
