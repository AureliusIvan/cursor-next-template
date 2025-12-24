import { EventEmitter } from "node:events";

class ContactEventEmitter extends EventEmitter {}

// Singleton instance to ensure all routes share the same emitter
const contactEvents = new ContactEventEmitter();

export { contactEvents };
