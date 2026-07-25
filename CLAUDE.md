# Claude Instructions

## Code Style

- Always add JSDoc comments in English for all methods and functions (including arrow functions, class methods, and exported functions). Include `@param` for each parameter and `@returns` for the return value.
- With every change check if e2e and unit tests should be updated or new tests should be added. Add or update existing tests if needed. Run tests to make sure all of them work.
- While developing new functionality with text (e.g. button, error message, text) do it via creating new locale. Add always russina and english translations.

## Design Context

- [`PRODUCT.md`](PRODUCT.md): strategic brief (register: product, platform: web, audience, positioning, brand personality, anti-references).
- [`DESIGN.md`](DESIGN.md): visual system, "The Ember Vault" (amber-to-crimson gradient on near-black, replacing the current purple accent). Colors, typography, components, and named rules for any new UI work.
- Every `/impeccable` command reads both files first; consult them before making visual or strategic product decisions.