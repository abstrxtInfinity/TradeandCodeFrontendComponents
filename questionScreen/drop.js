const dropArea = document.querySelector(".upload");

dropArea.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropArea.classList.add("onHover");
});

dropArea.addEventListener("dragleave", () => {
    dropArea.classList.remove("onHover");
});

dropArea.addEventListener("drop", (e) => {
    e.preventDefault();

    const pdf = e.dataTransfer.files[0];
    const type = pdf.type;

    if (type == "application/pdf") {
        return upload(pdf);
    } else {
        dropArea.setAttribute("class", "upload invalid");
        dropArea.innerText = "Invalid File Format. Re-Upload";
        return false;
    }
});

const upload = (pdf) => {
    dropArea.setAttribute("class", "upload valid");
    dropArea.innerText = "Added " + pdf.name;
};
