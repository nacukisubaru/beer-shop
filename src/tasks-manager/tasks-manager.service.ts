import { SchedulerRegistry } from "@nestjs/schedule";
import { CronJob } from "cron";
var moment = require('moment'); // require

export class TaskManagerService {
    schedulerRegistry: SchedulerRegistry;

    constructor() {
        this.schedulerRegistry = new SchedulerRegistry();
    }

    createTask(callback, name: string, configTime:string, isRemoveJob = false) {
        const job = new CronJob(configTime, () => { 
            console.log('task complete in time '+ moment().format());
            callback();
            if(isRemoveJob) {
                this.removeTask(name);
            }
        });
        console.log('task start in time '+moment().format());
        this.schedulerRegistry.addCronJob(name, job);
        job.start();
    }

    removeTask(name: string) {
        this.schedulerRegistry.deleteCronJob(name);
    }

    getTask(name: string) {
        return this.schedulerRegistry.getCronJob(name);
    }
}