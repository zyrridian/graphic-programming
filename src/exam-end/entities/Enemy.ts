import { Entity } from './Entity';

export abstract class Enemy extends Entity {
    public isBird: boolean = false;
    
    // Derived classes will implement the specific logic
}
