# Dynamo Prisma

This tool aims to provide a spec and a tool to use that spec to create dynamic `schema.prisma` files.

## Demo Checklist
1.⁠ ⁠include updating an older schema
2.⁠ ⁠⁠include migration happening automatically
3.⁠ ⁠⁠raise issues in case of non compatible update
4.⁠ ⁠⁠optionally should not allow for deletes at all.
5. The current use case has custom columns of different types (possibly not supported by prisma-schema-dsl). So might have to update that too.
6. I wasn’t aware a field could have these many types at the same time. How would we validate this schema through Prisma? 
All this should be in an abstraction above prisma-schema-dsl.