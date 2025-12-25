import { EventEmitter } from "node:events";

class ContactEventEmitter extends EventEmitter {}
class CompanyEventEmitter extends EventEmitter {}

// Singleton instances to ensure all routes share the same emitter
const contactEvents = new ContactEventEmitter();
const companyEvents = new CompanyEventEmitter();

export { contactEvents, companyEvents };
