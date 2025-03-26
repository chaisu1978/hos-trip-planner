// avatarUtils.ts
function stringToColor(string: string) {
    let hash = 0;
    for (let i = 0; i < string.length; i++) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }

    let color = "#";
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xff;
      color += `00${value.toString(16)}`.slice(-2);
    }
    return color;
  }

  function stringToContrastColor(string: string) {
    const hex = stringToColor(string);
    const contrastHex = hex.replace("#", "");
    const r = parseInt(contrastHex.substr(0, 2), 16);
    const g = parseInt(contrastHex.substr(2, 2), 16);
    const b = parseInt(contrastHex.substr(4, 2), 16);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 128 ? "#000000" : "#ffffff";
  }

  function generateAvatarLabel(firstName = "", lastName = "") {
    return `${(firstName[0] || "").toUpperCase()}${(lastName[0] || "").toUpperCase()}`;
  }

  export { stringToColor, stringToContrastColor, generateAvatarLabel };
