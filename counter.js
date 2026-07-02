import { ToastQueue } from "./toast.js";
import { parseMarkdown } from "./markdown.js";

let chars_label = document.getElementById("chars");
let chars_no_spaces_label = document.getElementById("chars_no_spaces");
let words_label = document.getElementById("words");
let paragraphs_label = document.getElementById("paragraphs");

const text_input = document.getElementById("text");
const preview = document.getElementById("preview");
const main_container = document.querySelector(".main");
const save_btn = document.getElementById("save");
const toggle_view_btn = document.getElementById("toggle-view");
const toggle_view_label = document.getElementById("toggle-view-label");
const sync_label = document.getElementById("sync-label");
const last_saved_label = document.getElementById("last-saved");
const sync_icons = document.querySelectorAll(".sync svg");

const toastQueue = new ToastQueue("toast-queue")

let timeout = null;
let autosync = localStorage.getItem("autosync");
let is_markdown_view = false;

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
    set_view(is_markdown_view)

})

text_input.addEventListener("input", () => {
    count_chars()
    update_preview()
})
text_input.addEventListener("keydown", handle_list_continuation)
save_btn.addEventListener("click", () => {
    save_content()
    toastQueue.addToast({
        title: "Content saved",
        body: "Text content saved on local storage"
    })
})

toggle_view_btn.addEventListener("click", () => {
    set_view(!is_markdown_view)
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

function set_view(markdown_view) {

    is_markdown_view = markdown_view;

    if (is_markdown_view) {
        update_preview();

        main_container.classList.add("split-view");
        toggle_view_label.textContent = "Hide preview";

    }else {
        main_container.classList.remove("split-view");
        toggle_view_label.textContent = "Preview MD";
    }

}

function update_preview() {
    if (is_markdown_view) {
        preview.innerHTML = parseMarkdown(text_input.value);
    }
}

function handle_list_continuation(event) {

    if (!is_markdown_view) return;
    if (event.key !== "Enter") return;
    if (text_input.selectionStart !== text_input.selectionEnd) return;

    const value = text_input.value;
    const cursor = text_input.selectionStart;

    const line_start = value.lastIndexOf("\n", cursor - 1) + 1;
    const line_end = value.indexOf("\n", cursor);
    const current_line = value.substring(line_start, cursor);

    const unordered_match = current_line.match(/^(\s*)([-*+])\s+(.*)$/);
    const ordered_match = current_line.match(/^(\s*)(\d+)([.)])\s+(.*)$/);
    const blockquote_match = current_line.match(/^(\s*)>\s?(.*)$/);

    const match = unordered_match || ordered_match || blockquote_match;
    if (!match) return;

    event.preventDefault();

    const content = match[match.length - 1];
    const indent = match[1];

    if (content.trim() === "") {
        const line_end_pos = line_end === -1 ? value.length : line_end;
        text_input.value = value.slice(0, line_start) + "\n" + value.slice(line_end_pos);
        text_input.selectionStart = text_input.selectionEnd = line_start + 1;

    }else {
        let marker;

        if (unordered_match) {
            marker = `${indent}${unordered_match[2]} `;
        }else if (ordered_match) {
            marker = `${indent}${parseInt(ordered_match[2], 10) + 1}${ordered_match[3]} `;
        }else {
            marker = `${indent}> `;
        }

        const insertion = "\n" + marker;
        text_input.value = value.slice(0, cursor) + insertion + value.slice(cursor);
        text_input.selectionStart = text_input.selectionEnd = cursor + insertion.length;
    }

    count_chars();
    update_preview();
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