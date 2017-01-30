const Discord = require("discord.js");
const bot = new Discord.Client();
const config = require("/Users/Shared/config.json");
const setTable = require(config.DataFilePath + "/FWTSetData.json");
const aliasListSets = require(config.DataFilePath + "/FWTSetAliases.json");
const aliasListHeroes = require(config.DataFilePath + "/FWTHeroAliases.json");
const rainbowRotation = require(config.DataFilePath + "/FWTSetRotation.json");
const heroDataTable = require(config.DataFilePath + "/FWTHeroStats.json");

for (let i = 0, len = setTable.length; i < len; i++) {
    for (let j = 0, weeks = rainbowRotation.length; j < weeks; j++) {
        let grade = setTable[i]["Tier"].length.toString() + setTable[i]["Grade"];
        if (rainbowRotation[j][grade] == setTable[i]["Name"]) {
            setTable[i]["Last Time in the Rotation"] = rainbowRotation[j]["Week"];
        }
    }
}

function coocooPull(isLast) {
    var number = Math.random();
    if (isLast) {
        var junkrate = 0;
        var platrate = 0;
        var arate = 0.7;
        var srate = 0.27;
    } else {
        var junkrate = 0.55;
        var platrate = 0.28;
        var arate = 0.1;
        var srate = 0.045;
    }
    if (number < junkrate) return "junk";
    else if (junkrate <= number && number < junkrate + platrate) return "platinum";
    else if (junkrate + platrate <= number && number < junkrate + platrate + arate) return "A_set";
    else if (junkrate + platrate + arate <= number && number < junkrate + platrate + arate + srate) return "S_set";
    else return "SS_set";
}
function coocooPull10() {
    var pull10 = new Array(10);
    pull10.fill(null);
    return pull10.map((element, index, array) => coocooPull(index === array.length - 1));
}   // End of CooCoo Pulling functions



function createOutput(list) {
    const flagNames = ["confusion", "charm", "stun", "taunt", "disarm", "immobilize", "decrease movement", "dot", "mp burn", "skill cost", "defense ignore", "defense ignoring damage", "weakening", "buff removal", "hp% damage", "defense decrease", "attack decrease", "hp drain"];
    var dataString = "";
    for (var property in list) {
        if ((list.hasOwnProperty(property)) && (!flagNames.includes(property))) {
            dataString = dataString + property + ": " + list[property] + "\n";
        }
    }
    return dataString;
}
function findNameByAlias(alias, isSet) {
    if (isSet) var aliasList = aliasListSets;
    else var aliasList = aliasListHeroes;
    for (var i = 0, setnum = aliasList.length; i < setnum; i++) {
        for (var j = 0, len = aliasList[i]["aliases"].length; j < len; j++) {
          	if (aliasList[i]["aliases"][j] == alias) return aliasList[i]["name"];
        }
    }
  	return "nosuchalias";
}
function findData(alias, isSet) {
    if (isSet) {
  	    var name = findNameByAlias(alias, true);
        var dataTable = setTable;
    }
    else {
  	    var name = findNameByAlias(alias, false);
        var dataTable = heroDataTable;
    }
  	if (name == "nosuchalias") return "nosuchdata";
    var data = dataTable[0];
    for (var i = 1, len = dataTable.length; i < len; i++) {
        if (dataTable[i]["Name"] == name) data = dataTable[i];
    }

    return createOutput(data);
}
function SetsOfTheWeek(WeekRequested) {
    var rainbowData = rainbowRotation[rainbowRotation.length - 1 - WeekRequested];
    return createOutput(rainbowData);
}   // End of database functions



function PullOrNot() {
    var number = Math.random();
    var YesNo;
    if (number <= 0.5) YesNo =  config.FilePath + "/Images/Pull.png";
    else YesNo = config.FilePath + "/Images/Don't Pull.png";
    return YesNo;
}
function findEmojiFromGuildByName(guild, emoji_name) {
    const emoji = guild.emojis.find((emoji) => emoji.name === emoji_name);
    return emoji ? emoji.toString() : emoji_name;
}   // End of random functions



bot.on("message", msg => {
    if (!msg.content.startsWith(config.prefix)) return; // Checks for prefix
    if (msg.author.bot) return; // Checks if sender is a bot

    if ((msg.channel.id == config.ReservedGeneral) && (msg.content.startsWith(config.prefix + "set") !== true) && (msg.content.startsWith(config.prefix + "hero") !== true)) {
        msg.channel.sendMessage(msg.content + " command is not allowed here. Please use it in " + config.ReservedCode + " or " + config.ReservedCasino);
        return;
    }


    if (msg.content.startsWith(config.prefix + "ping")) msg.channel.sendMessage("pong!"); // Testing purposes

    
    else if (msg.content.startsWith(config.prefix + "tadaima") && (msg.content.includes("maid"))) msg.channel.sendMessage("おかえりなさいませ！ご主人様♥, \nDo you want dinner or a shower or \*blushes\* me?");
    else if (msg.content.startsWith(config.prefix + "tadaima") && (msg.content.includes("spades"))) msg.channel.sendMessage("おかえりなさいませ！ご主人様 :anger:, \nWell, I don't have much of a choice. I guess I'll end this here since I got ~~Shido~~ Spades-san to pat my head today.----right, all of me?");
    else if (msg.content.startsWith(config.prefix + "tadaima")) msg.channel.sendMessage("Okaeri dear, \nDo you want dinner or a shower or \*blushes\* me?");
    else if (msg.content.startsWith(config.prefix + "tuturu")) msg.channel.sendFile(config.FilePath + "/Images/Tuturu.png"); // Tuturu
    else if (msg.content.startsWith(config.prefix + "moe")) msg.channel.sendFile(config.FilePath + "/Images/Shushu/moe.PNG");
    // End of customer service
    
    else if (msg.content.startsWith(config.prefix + "pull")) msg.channel.sendFile(PullOrNot());
    
    else if (msg.content.startsWith(config.prefix + "whale")) { // 10x pull
        const pulls = coocooPull10().map((emoji_name) => findEmojiFromGuildByName(msg.guild, emoji_name));
        msg.channel.sendMessage(pulls.join(" "));

    } else if (msg.content.startsWith(config.prefix + "set")) { // Searches database for set info
        var setName = msg.content.slice(msg.content.indexOf(" ", 0) + 1, msg.content.length);
        var setInfo = findData(setName.toLowerCase(), true);
        if (setInfo != "nosuchdata") msg.channel.sendMessage(setInfo);
        else msg.channel.sendMessage("Unknown Set!");

    } else if (msg.content.startsWith(config.prefix + "stats")) {
        var heroRequested = msg.content.slice(msg.content.indexOf(" ", 0) + 1, msg.content.length);
        var heroStats = findData(heroRequested.toLowerCase(), false);
        if (heroStats != "nosuchdata") msg.channel.sendMessage(heroStats);
        else msg.channel.sendMessage("Unknown Hero!");
        
    } else if (msg.content.startsWith(config.prefix + "nameset") && (msg.author.id == config.ownerID)) {
        msg.guild.member(bot.user).setNickname("A Certain Magical Bot");
        msg.channel.sendMessage("My name has been set!");

    } else if (msg.content.startsWith(config.prefix + "rainbow")) {
        if (msg.content.indexOf(" ",0) != -1) {
            var WeekRequested = msg.content.slice(msg.content.indexOf(" ",0) + 1, msg.content.length);
        } else WeekRequested = 0;
        const currentSets = SetsOfTheWeek(WeekRequested);
        msg.channel.sendMessage(currentSets);
    }
});
bot.on("ready", () => {
    console.log("I am ready!");
    bot.user.setGame("with TOD Hell Sets");
});
bot.on("error", e => { console.error(e); });
bot.login(config.token);
