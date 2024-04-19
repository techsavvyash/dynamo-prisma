# dynamo-prisma

Generate Prisma schema dynamically using json file.

## Installation

```bash
npm install @techsavvyash/dynamo-prisma
```



## Usage
For information on schema you should follow, visit: [JSON Schema](./docs/schema.md)

## References

- [Generating only the Prisma Migrations](https://github.com/prisma/prisma/discussions/9691)

## License

[MIT License](./LICENSE)

### Open Questions

1. What should be the expected behaviour in case the target database is not empty and already contains some tables/migrations applied to it (tracked via the migrations table created by prisma) but those migrations are not present in the migrations folder.
_Options_: Do we do a `prisma db pull`?? But this overwrites the `schema.prisma`