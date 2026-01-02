import { EventEmitter } from "node:events";

class ContactEventEmitter extends EventEmitter {}
class CompanyEventEmitter extends EventEmitter {}
class ProjectEventEmitter extends EventEmitter {}

// Singleton instances to ensure all routes share the same emitter
const contactEvents = new ContactEventEmitter();
const companyEvents = new CompanyEventEmitter();
const projectEvents = new ProjectEventEmitter();

export { contactEvents, companyEvents, projectEvents };
