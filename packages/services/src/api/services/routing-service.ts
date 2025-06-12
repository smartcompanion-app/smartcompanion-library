export interface RoutingService {

    push(uri: string): Promise<void>;

    pop(): Promise<void>;

    pushReplaceCurrent(uri: string): Promise<void>;

    pushReplace(uri:string): Promise<void>;

    /**
     * 
     * Trigger callback when route change matches "to"
     * to can be a string or a string ending with "*", when eding with "*" it will match the beginning of the route
     *  
     * @param to 
     * @param callback 
     */
    addRouteChangeListener(to: string, callback: () => void): void;

}
