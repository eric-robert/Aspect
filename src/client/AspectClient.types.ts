import { AspectEngine, EngineModule } from "../index.shared";

export interface Config {
    modules ?: Class<EngineModule>[]
}

export interface Class<T> {
    new(engine : AspectEngine) : T
}