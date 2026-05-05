import { ToastQueue } from "./toast.js";

let chars_label = document.getElementById("chars");
let chars_no_spaces_label = document.getElementById("chars_no_spaces");
let words_label = document.getElementById("words");
let paragraphs_label = document.getElementById("paragraphs");

const text_input = document.getElementById("text");
const save_btn = document.getElementById("save");
const sync_label = document.getElementById("sync-label");
const last_saved_label = document.getElementById("last-saved");
const sync_icons = document.querySelectorAll("svg");

const toastQueue = new ToastQueue("toast-queue")

let timeout = null;
let autosync = localStorage.getItem("autosync");

const str_to_bool = {
    "false": false,
    "true": true
}

if (autosync === null) {
    autosync = true;
    localStorage.setItem("autosync", autosync);

}else{
    autosync = str_to_bool[autosync];
}

document.addEventListener("DOMContentLoaded", () => {
    let last_saved = localStorage.getItem("last_saved")
    let saved_text = localStorage.getItem("text_content");
    
    if (saved_text) {
        text_input.value = saved_text;
    }
    
    count_chars(false);
    
    set_sync_icons(autosync)

})

text_input.addEventListener("input", count_chars)
save_btn.addEventListener("click", () => {
    save_content()
    toastQueue.addToast({
        title: "Content saved",
        body: "Text content saved on local storage"
    })
})

sync_icons.forEach(icon => {
    icon.addEventListener("click", change_autosync);
})

function save_content() {

    let saved_date = new Date()

    let date_string = `${saved_date.getDate()}/${saved_date.getMonth() + 1}/${saved_date.getFullYear()} ${saved_date.getHours()}:${saved_date.getMinutes()}:${saved_date.getSeconds()}`;

    localStorage.setItem("text_content", text_input.value);
    localStorage.setItem("last_saved", date_string);

    last_saved_label.textContent = "Last saved on: " + date_string

}

function auto_save() {
  clearTimeout(timeout);

  timeout = setTimeout(() => {
    save_content()
      
    if (autosync) {
        
        document.getElementById("sync-on").classList.add("spin-annimation")
          
    }

    setTimeout(() => {
        document.getElementById("sync-on").classList.remove("spin-annimation")
    }, 1000)
        
  }, 5000);
}

function change_autosync() {

    autosync = !autosync
    localStorage.setItem("autosync", autosync);

    set_sync_icons(autosync);

}

function set_sync_icons(cur_autosync) {

    if (cur_autosync){
        sync_icons[0].style.display = "block";
        sync_icons[1].style.display = "none";

        sync_label.textContent = "Autosave: on";

    
    }else {
        sync_icons[0].style.display = "none";
        sync_icons[1].style.display = "block";

        sync_label.textContent = "Autosave: off";
    }
}

function count_chars(save = true){
    let text = text_input.value
    
    if (text.length == 0){
        chars_label.textContent = "Characters: 0";
        chars_no_spaces_label.textContent = "No spaces: 0";
        words_label.textContent = "Words: 0";
        paragraphs_label.textContent = "Paragraphs: 0";

        if (autosync && save) {
            auto_save();
        }
        
    }else{
        
        let chars = text.length;
        let chars_no_spaces = text.replace(/\s/g, "").length;
        let words = text.split(" ").length;
        let empty_lines = text.split("\n").filter(line => line.trim() === '').length;
        let paragraphs = text.split("\n").length - empty_lines;
        
        chars_label.textContent = "Characters: " + chars;
        chars_no_spaces_label.textContent = "No spaces: " + chars_no_spaces;
        words_label.textContent = "Words: " + words;
        paragraphs_label.textContent = "Paragraphs: " + paragraphs;

    }

    if (autosync && save) {
        auto_save();
    }
}