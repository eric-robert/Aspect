export class MultiMap<K,V extends {id : number}> {

    // Lookup for all entities
    private all_entities : Map<number, V> = new Map()

    // Lookup for all values subscribed to a key
    private lookupByKey : Map<K, Set<V>> = new Map()

    // Lookup for all values and values it associated with a key
    private lookupByValue : Map<V, Set<K>> = new Map()


    // Utilites

    public add ( key : K, value : V) {
    
        const entity_value = this.all_entities.get(value.id)
        if (!entity_value) this.all_entities.set(value.id, value)

        const valueList = this.lookupByKey.get(key)
        if (!valueList) this.lookupByKey.set(key, new Set([value]))
        else valueList.add(value)

        const entityList = this.lookupByValue.get(value)
        if (!entityList) this.lookupByValue.set(value, new Set([key]))
        else entityList.add(key)

    }

    public add_many ( keys : K[], value : V ) {
        keys.forEach( key => this.add(key, value))
    }

    public remove (key : K, value : V) {
        
        this.lookupByKey.get(key).delete(value)
        this.lookupByValue.get(value).delete(key)

        const lastKey = this.lookupByKey.get(key).size === 0
        const lastValue = this.lookupByValue.get(value).size === 0

        if (lastKey) this.lookupByKey.delete(key)
        if (lastValue) this.lookupByValue.delete(value)
        if (lastKey && lastValue) this.all_entities.delete(value.id)

    }

    public remove_many ( keys : K[], value : V ) {
        keys.forEach( key => this.remove(key, value))
    }

    public delete ( id : number ) {

        const to_delete = this.all_entities.get(id)
        const keys = this.lookupByValue.get(to_delete)
        if (!keys) return
        keys.forEach( key => this.remove(key, to_delete))

    }

    // Getters

    get_byID ( id : number ) {
        return this.all_entities.get(id)
    }

    get_valuesByKey ( key : K ) { 
        return this.lookupByKey.get(key) || [] 
    }

    get_keysByValue ( value : V ) {
        return this.lookupByValue.get(value) || []
    }

    get_allValues () {
        return Array.from(this.all_entities.values())
    }

    get_allKeys () {
        return Array.from(this.lookupByKey.keys())
    }

    get_valuesCount () {
        return this.all_entities.size
    }

}
