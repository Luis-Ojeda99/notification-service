document.addEventListener("DOMContentLoaded", () => {
  const templateSelect = document.getElementById("template");
  if (templateSelect) {
    templateSelect.addEventListener("change", function () {
      const selected = this.options[this.selectedIndex];
      if (selected.value) {
        document.getElementById("channel").value = selected.dataset.channel;
        document.getElementById("subject").value =
          selected.dataset.subject || "";
        document.getElementById("content").value = selected.dataset.content;
      }
    });
  }
});
