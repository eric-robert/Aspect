import { AspectEngine, EngineModule } from "../index.shared";

export interface Config {
    modules ?: Class<EngineModule>[],
    metrics ?: Function
}

export interface Class<T> {
    new(engine : AspectEngine) : T
}