var med = null;
var self = null;

export default class Chat {
  constructor(mediator) {
    this.mediator = mediator;
    med = this.mediator;
    self = this;
    self.cache = null;

    // subscribe to outSideChatMessages
    med.ee.on("chat:ExtMsg", self.receiver);

    return this;
  }

  /* A message is sending out from me */
  broadcast(data) {
    let senderType = "local";
    if (!self.executeCommand(data)) {
      if (data.sender && data.to && data.sender == data.to) return;
      if (!data.ts) data.ts = Date.now();
      med.ee.emit("chat:IntMsg", data);
      med.metaData.sendChatData(data);
      self.showInChat(data, senderType);
    }

  }

  receiver(data) {
    if (data.event !== "chat") { return; }
    let senderType = "remote";
    self.showInChat(data, senderType);
  }

  executeCommand(data) {
    if (data.msg.startsWith("/")) {
      var trigger = data.msg.replace("/", "");
      switch (trigger) {
        case "help":
          data.msg = "Welcome to chat commands these are your options:<br>" +
            "/help - this will trigger this information";
          self.showInChat(data);
          return true;
        case "qxip":
        case "qvdev":
          self.showTime("Europe/Amsterdam", data)
          return true;
        case "jabis":
          self.showTime("Asia/Bangkok", data)
          return true;
        case "joe":
          data.msg = "&#128526;"
          return true;
        case "dletta":
          self.showTime("America/Vancouver", data)
          return true;
        case "graph":
          med.ee.emit("graph:toggle", data)
          return true;
        case "graphU":
          med.ee.emit("graph:update", data)
          return true;
        default:
          return false;
      }
    } else {
      return false;
    }
  }

  showInChat(data, senderType) {
    if (data == self.cache) {
      self.cache = null;
      return;
    }
    let chatMsgDiv = document.querySelector("#chat-messages");
    let contentAlign = "justify-content-end";
    let senderName = data.sender;
    let msgBg = "bg-white";

    if (senderType === "remote") {
      contentAlign = "justify-content-start";
      senderName = data.sender;
      msgBg = "bg-green";

      med.h.toggleChatNotificationBadge();
    }
    let infoDiv = document.createElement("div");
    infoDiv.className = "sender-info";
    infoDiv.innerHTML = `${senderName} - ${moment().format(
      "Do MMMM, YYYY h:mm a"
    )}`;
    let colDiv = document.createElement("div");
    colDiv.className = `col-10 card chat-card msg ${msgBg}`;
    colDiv.innerHTML = data.msg;
    let rowDiv = document.createElement("div");
    rowDiv.className = `row ${contentAlign} mb-2`;
    colDiv.appendChild(infoDiv);
    rowDiv.appendChild(colDiv);
    chatMsgDiv.appendChild(rowDiv);
    /**
     * Move focus to the newly added message but only if:
     * 1. Page has focus
     * 2. User has not moved scrollbar upward. This is to prevent moving the scroll position if user is reading previous messages.
     */
    if (this.pageHasFocus) {
      rowDiv.scrollIntoView();
    }
    self.cache = data;
  }

  async showTime(timezone, data) {
    let response = await fetch("https://worldtimeapi.org/api/timezone/" + timezone);
    if (response.ok) {
      let json = await response.json();
      data.msg = json.datetime;
      this.showInChat(data);
    }
  }
}
