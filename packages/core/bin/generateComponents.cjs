#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// Check for the required arguments
if (process.argv.length !== 4) {
  console.log("Usage: <script> <manifest-path> <output-path>");
  process.exit(1);
}

// Extract paths from command-line arguments
const jsonFilePath = path.resolve(process.argv[2]);
const jsFilePath = path.resolve(process.argv[3]);

// Extract recs package version
const { dependencies } = require(path.resolve("./package.json"));
const recsVersion = dependencies?.["@latticexyz/recs"] ?? "";
const isRecsVersion2 = /^[\^\~]?2./g.exec(recsVersion) != null;
console.log(`...generating for @latticexyz/recs version ${isRecsVersion2 ? '2 (bigint support, Entity as string)' : '1 (no bigint, EntityIndex as number)'}`)

const cairoToRecsType = {
  "bool": "RecsType.Boolean",
  "u8": "RecsType.Number",
  "u16": "RecsType.Number",
  "u32": "RecsType.Number",
  "u64": "RecsType.Number",
  "usize": "RecsType.Number",
  "u128": isRecsVersion2 ? "RecsType.BigInt" : "RecsType.Number",
  "u256": isRecsVersion2 ? "RecsType.BigInt" : "RecsType.NumberArray",
  "felt252": isRecsVersion2 ? "RecsType.BigInt" : "RecsType.Number",
  "ContractAddress": isRecsVersion2 ? "RecsType.BigInt" : "RecsType.Number",
}


fs.readFile(jsonFilePath, "utf8", (err, jsonString) => {
  if (err) {
    console.log("Error reading file:", err);
    return;
  }

  try {
    const data = JSON.parse(jsonString);
    let fileContent = `/* Autogenerated file. Do not edit manually. */\n\n`;
    fileContent += `import { defineComponent, Type as RecsType, World } from "@latticexyz/recs";\n\n`;
    fileContent += `export function defineContractComponents(world: World) {\n  return {\n`;

    data.models.forEach((model) => {
      let types = []

      const tableName = model.name;
      fileContent += `    ${tableName}: (() => {\n`;
      fileContent += `      const name = "${tableName}";\n`;
      fileContent += `      return defineComponent(\n        world,\n        {\n`;

      model.members.filter(m => !m.key).forEach((member) => {
        let memberType = cairoToRecsType[member.type] ?? "RecsType.Number";  // Default type set to Number
        fileContent += `          ${member.name}: ${memberType},\n`;
        types.push(member.type);
      });

      fileContent += `        },\n        {\n`;
      fileContent += `          metadata: {\n`;
      fileContent += `            name: name,\n`;
      if (isRecsVersion2) {
        fileContent += `            types: ${JSON.stringify(types)},\n`;
      }
      fileContent += `          },\n        }\n      );\n    })(),\n`;
    });

    fileContent += `  };\n}\n`;

    fs.writeFile(jsFilePath, fileContent, (err) => {
      if (err) {
        console.log("Error writing file:", err);
      } else {
        console.log("File generated successfully");
      }
    });
  } catch (err) {
    console.log("Error parsing JSON string:", err);
  }
});