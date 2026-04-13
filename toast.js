class Toast {

    constructor(toast_id) {

        
        if (toast_id.charAt(0) != "#") {
            this.id = "#" + toast_id
            
        }else {
            this.id = toast_id

        }

        try{
            this.toast = $(this.id);
        
        }catch(exception){
            throw new Error("Toast not found");
        
        }

        this.bar = this.toast.find("span") ? $(this.id + " span") : null;
        this.tittle = $(this.id + " h1");
        this.body = $(this.id + " p");

        this.defaultTimerIntervalMs = 10

    }

    setBackgroundColour(bgColour) {

        if (!bgColour.includes("var(")){
            bgColour = `var(${bgColour})`
        }

        this.toast.css("background-color", bgColour)

    }

    hide() {
        this.toast.hide(80);
    }

    async show(hide_timeout) {

        this.toast.css("display", "grid")

        let remainingTime = hide_timeout;

        while (remainingTime > 0) {

            if (this.bar){
                let percentage = ((remainingTime / hide_timeout) * 100).toFixed(2) + "%"
                this.bar.css("width", percentage)
            }

            remainingTime -= this.defaultTimerIntervalMs
            await new Promise(resolve => setTimeout(resolve, this.defaultTimerIntervalMs));

        }

        this.hide();

    }

}

export class ToastQueue {

    constructor(queue_id) {

        if (queue_id.charAt(0) != "#") {
            this.id = "#" + queue_id
            
        }else {
            this.id = queue_id

        }

        this.queue = []
        this.currentToast = 0

        this.defaultTimeoutMs = 800

    }

    createToastElement(toast_params) {

        let toast_info = {
            title: "Error",
            body: "Invalid opeartion",
            toastColour: "hsl(132, 59%, 33%)",
            ...toast_params
        }

        let toast_dom = `
            <div class="toast" id="toast-${toast_info.id}">
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M808-669.08v434.46q0 35.05-23.79 58.83Q760.43-152 725.38-152H234.62q-35.05 0-58.83-23.79Q152-199.57 152-234.62v-490.76q0-35.05 23.79-58.83Q199.57-808 234.62-808h434.46L808-669.08Zm-58 23.52L645.56-750H234.62q-10.77 0-17.7 6.92-6.92 6.93-6.92 17.7v490.76q0 10.77 6.92 17.7 6.93 6.92 17.7 6.92h490.76q10.77 0 17.7-6.92 6.92-6.93 6.92-17.7v-410.94ZM538.04-320.54Q562-344.62 562-378.58t-24.08-57.92q-24.08-23.96-58.04-23.96t-57.92 24.08Q398-412.3 398-378.34t24.08 57.92q24.08 23.96 58.04 23.96t57.92-24.08ZM280.77-547.23h304.92v-132H280.77v132ZM210-632.56V-210v-540 117.44Z"/></svg>
                <div>
                    <h1>${toast_info.title}</h1>
                    <p>${toast_info.body}</p>
                </div>
                <span></span>
            </div>`

        $(this.id).append(toast_dom)

    }

    addToast(toast_params) {

        let toast_info = {
            title: "Error",
            body: "Invalid opeartion",
            toastColour: "hsl(132, 59%, 33%)",
            id: this.currentToast,

            ...toast_params
        }

        this.createToastElement(toast_info)

        this.queue.push(new Toast("toast-" + this.currentToast))
        this.queue[this.currentToast].setBackgroundColour(toast_info.toastColour)
        this.queue[this.currentToast].show(this.defaultTimeoutMs)

        this.currentToast++

    }

}