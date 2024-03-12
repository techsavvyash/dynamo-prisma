var fs = require("fs");
function generatePrismaSchema(entity) {
    var prismaSchema = "model ".concat(entity.name, " {\n");
    var attributes = entity.fields.Attribute;
    for (var _i = 0, attributes_1 = attributes; _i < attributes_1.length; _i++) {
        var attribute = attributes_1[_i];
        prismaSchema += "  ".concat(attribute.Name, ": ").concat(attribute.Type);
        if (attribute.Additional) {
            var additional = attribute.Additional;
            if (additional.isRequired) {
                prismaSchema += " @id";
            }
            if (additional.isUnique) {
                prismaSchema += " @unique";
            }
            if (additional.isIndexed) {
                prismaSchema += " @index";
            }
            if (additional.isDefault && attribute.DefaultValue !== undefined) {
                prismaSchema += " @default(".concat(attribute.DefaultValue, ")");
            }
            else if (additional.isDefault &&
                additional.Defaultvalues &&
                additional.Defaultvalues.Autoincrement) {
                prismaSchema += " @default(autoincrement())";
            }
            else if (additional.isDefault &&
                additional.Defaultvalues &&
                additional.Defaultvalues.Uuid) {
                prismaSchema += " @default(uuid())";
            }
            if (!additional.isNullable) {
                prismaSchema += " @db.VarChar(".concat(additional.maxLength, ")");
            }
            if (additional.enumValues && additional.enumValues.length > 0) {
                prismaSchema += " @db.Enum(".concat(additional.enumValues
                    .map(function (value) { return "\"".concat(value, "\""); })
                    .join(", "), ")");
            }
        }
        prismaSchema += "\n";
    }
    prismaSchema += "}";
    return prismaSchema;
}
function generatePrismaSchemaFromFile(filePath) {
    fs.readFile(filePath, "utf8", function (err, data) {
        if (err) {
            console.error("Error reading JSON file:", err);
            return;
        }
        try {
            var jsonData = JSON.parse(data);
            var prismaSchema = generatePrismaSchema(jsonData);
            fs.writeFile("prisma.schema", prismaSchema, function (err) {
                if (err) {
                    console.error("Error writing Prisma schema:", err);
                }
                else {
                    console.log("Prisma schema generated successfully!");
                }
            });
        }
        catch (error) {
            console.error("Error parsing JSON:", error);
        }
    });
}
if (process.argv.length < 3) {
    console.error("Please provide the file address as an argument.");
    process.exit(1);
}
var filePath = process.argv[2];
generatePrismaSchemaFromFile(filePath);
