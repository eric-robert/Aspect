import { AspectEngine } from "./Engine";
import { EngineModule } from "./modules/Module";

export interface AspectEngineConstuctor {

    modules : ModuleBuilder<EngineModule>[],
    settings : EngineSettings

}

export interface ModuleBuilder<T> {
    new(engine : AspectEngine) : T
}

export type ValidSettings = string | number
export interface EngineSettings {
    [key: string]: ValidSettings
}
