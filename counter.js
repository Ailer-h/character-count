let chars_label = document.getElementById("chars");
let chars_no_spaces_label = document.getElementById("chars_no_spaces");
let words_label = document.getElementById("words");
let paragraphs_label = document.getElementById("paragraphs");

let text_input = document.getElementById("text");

document.addEventListener("DOMContentLoaded", count_chars)
text_input.addEventListener("input", count_chars)

function count_chars(){
    let text = text_input.value
    
    if (text.length == 0){
        chars_label.textContent = "Characters: 0"
        chars_no_spaces_label.textContent = "No spaces: 0"
        words_label.textContent = "Words: 0"
        paragraphs_label.textContent = "Paragraphs: 0"
        return;
        
    }

    let chars = text.length
    let chars_no_spaces = text.replace(/\s/g, "").length
    let words = text.split(" ").length
    let empty_lines = text.split("\n").filter(line => line.trim() !== '').length
    let paragraphs = text.split("\n").length - empty_lines
    
    chars_label.textContent = "Characters: " + chars
    chars_no_spaces_label.textContent = "No spaces: " + chars_no_spaces
    words_label.textContent = "Words: " + words
    paragraphs_label.textContent = "Paragraphs: " + paragraphs
}