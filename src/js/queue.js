import {bus} from "vue3-eventbus";
function uuidv4() {
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
        (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
    );
}

class Message {
    constructor(id, message) {
        this.id = id;
        this.message = message;
    }
}

class Queue {
    constructor(queueName) {
        this.queueName = queueName;
        this.queue = [];
    }

    push(message) {
        this.queue.push(message);
    }

    pop() {
        return this.queue.shift()
    }

    reInsert(obj){
        this.queue.splice(0, 0, obj)
    }
}

class MessageBus{
    constructor() {
        this.queue = {};
    }

    emit(queueName, message){
        if(!this.queue[queueName]) {
            this.queue[queueName] = new Queue(queueName);
        }
        this.queue[queueName].push(new Message(uuidv4(), message))
    }

    async on(queueName, callback){
        if(!this.queue[queueName]) {
            this.queue[queueName] = new Queue(queueName);
        }
        let handler = ()=>{
            let message = this.queue[queueName].pop();
            if(message){
                let result = callback(message.message);
                if(typeof result !== "boolean"){
                    throw new Error('bus.on回调函数必须返回boolean类型')
                }
                if(result === false){
                    this.queue[queueName].reInsert(message)
                }
            }
        };
        handler()
        setInterval(handler, 100);
    }

}

// const bus = new MessageBus();
export {
    bus, MessageBus
}
