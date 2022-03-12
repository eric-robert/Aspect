## Structure to keep this project organized

### Types

- Files that use custom types should have a file.types.ts in the same directory
- That file will then use something below to signify those types come from local

``` ts
import * as T from './file.types.ts'
```

- Type files constructed this way SHOULD NOT have imports. It makes everything messy
    - If you need to use external types, use a <T> generic
    - This is not allways true, but try to make it as much as possible
    

### Functions

- Use `private` or `public` rather than letting it be explicit
- function names should follow the format:

```ts

public function set_variable ();
public function get_timeTillEnd ();
public function do_quickMaths ();

```

- Do indicates side effects, set is setting, and gets should not have side effects
