const isLandscape = false;
const PAGE_WIDTH = isLandscape ? 1120 : 820;
const PAGE_HEIGHT = isLandscape ? Math.floor(1120 * (190/277)) : Math.floor(820 * (277/190));
console.log(PAGE_WIDTH, PAGE_HEIGHT);
