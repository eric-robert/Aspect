import * as T from './Engine.types';
import { EngineModule } from './modules/Module';
import { HandshakeModule } from './modules/Handshake.module';
import { EventBus } from '../classes/eventbus/EventBus';
export declare class AspectEngine {
    private logger;
    private modules;
    private handshakeModule;
    private eventBus;
    private settings;
    constructor(config: T.AspectEngineConstuctor);
    withSetting(name: string, _default: T.ValidSettings): T.ValidSettings;
    withHandshakeModule(): HandshakeModule;
    withEventBus(): EventBus;
    withModule<T extends EngineModule>(module: T.ModuleBuilder<T>): T;
}
