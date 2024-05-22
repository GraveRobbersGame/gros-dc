import * as PIXI from "/js/pixi.js";

// Color and naming constants
const colors = {
    "character":0x0086ff,
        "extra":0x0086ff,
    "creature":0xaa0000,
    "prop":0xff6600,
    "location":0x008000,
    "special-effect":0xffcc00,
    "roll-the-credits":0x000000,
    "plot-twist":0x553399
};
const typeNames = {
    "character":"CHARACTER",
        "extra":"EXTRA",
    "creature":"CREATURE",
    "prop":"PROP",
    "location":"LOCATION",
    "special-effect":"SPECIAL EFFECT",
    "roll-the-credits":"",
    "plot-twist":"PLOT TWIST"
};
const statText = {
    "character":"DEFENSE",
        "extra":"DEFENSE",
    "creature":"ATTACK",
    "prop":"DEFENSE",
    "location":"DEFENSE",
    "special-effect":"",
    "roll-the-credits":"",
    "plot-twist":"POINTS"
};

//This is the generic class for a Card
export class Card extends PIXI.Container {

//Context
static context = `/`;

static setContext(con) {
    Card.context = con;
}

//Card constructor
constructor(data) {

    let context = Card.context;

    //Check context
    if (context == undefined) context = "";

    //Check data
    if (data == undefined) data = {};

    //Call super
    super();

    //Set interactive flag
    this.interactive = false;

    //Set flag for if it's a playtest print
    this.playtest   = data?.playtest    ?? false;

    //Set up basic stats all cards have & defaults
    this.type       = data?.type        ?? "character";         //Type
    this.name       = data?.name        ?? "Card Name";         //Name
    this.traits     = data?.traits      ?? ["None"];            //Traits list
    this.stat       = data?.stat        ?? 10;                  //Defense/Attack/Points
    this.popcorn    = data?.popcorn     ?? 5;                   //Popcorn cost
    this.bucket     = data?.bucket      ?? true;                //Bucket present
    this.quote      = data?.quote       ?? `"Witty quote!"`;    //Quote text
    this.abilities  = data?.abilities   ?? "[Abilities]";       //Abilities text
    this.title      = data?.title       ?? "Title Word";        //Upside-down title
    this.number     = data?.number      ?? "XXX";               //Number
    this.siglum     = data?.siglum      ?? "custom";            //Release siglum
    this.language   = data?.language    ?? "en";                //Language

    this.art        = data?.art         ?? null;                //Art API end point
    this.image      = data?.image       ?? '/img/default.jpg';  //Art image
    this.artist     = data?.artist      ?? "None";              //Artist's name
    this.artx       = data?.artx        ?? 0;                   //X adjust
    this.arty       = data?.arty        ?? 0;                   //Y adjust
    this.artz       = data?.artz        ?? 1;                   //Zoom factor
    this.artbg      = data?.artbg       ?? 0x000000;            //Default background

    this.mechanic   = data?.mechanic    ?? "None";              //Mechanic's name

    //Pointy cursor
    this.cursor = 'pointer';

    //Rasterization resolution (pass on to parts)
    this.resolution = 6;

    //Build the card structures.
    this.structures = {};

    //Load Needed Fonts
    // These still will still need to be loaded by the browser separately.
    PIXI.Assets.addBundle('fonts', {
        Avenir: `${context}fonts/AvenirLTStd-Roman.otf`,
        Rockwell: `${context}fonts/ROCK.TTF`,
        Montserrat: `${context}fonts/Montserrat-VariableFont_wght.ttf`
    });

    //Call update()
    this.update()

} //END constructor()

update() {

    //Check model inputs
    this.type       ??= "character";         //Type
    this.name       ??= "Card Name";         //Name
    this.traits     ??= ["None"];            //Traits list
    this.stat       ??= 10;                  //Defense/Attack/Points
    this.popcorn    ??= 5;                   //Popcorn cost
    this.bucket     ??= true;                //Bucket present
    this.quote      ??= `"Witty quote!"`;    //Quote text
    this.abilities  ??= "[Abilities]";       //Abilities text
    this.title      ??= "Title Word";        //Upside-down title
    this.number     ??= "XXX";               //Number
    this.siglum     ??= "custom";            //Release siglum
    this.language   ??= "en";                //Language

    this.art        ??= null;                //Art API end point
    this.image      ??= null;                //Art image
    this.artist     ??= "None";              //Artist's name
    this.artx       ??= 0;                   //X adjust
    this.arty       ??= 0;                   //Y adjust
    this.artz       ??= 1;                   //Zoom factor
    this.artbg      ??= 0x000000;            //Background

    this.mechanic   ??= "None";              //Mechanic's name

    let context = Card.context;

    //Clear the card entirely
    this.removeChildren();

    /////////////
    // Artwork //
    /////////////

    //Background color
    let artBG = new PIXI.Graphics();
        artBG.beginFill(this.artbg); console.log(this.artbg);
        artBG.drawRect(0,40,240,240);
        artBG.endFill();
        this.addChild(artBG);
        
    //Mask
    let artMask = new PIXI.Graphics();
        artMask.beginFill(0xffffff);
        artMask.drawRect(0,40,240,240);
        artMask.endFill();
        this.addChild(artMask);

    //Art image
    let artfileUrl = this.image;
        if (artfileUrl == null) {
            artfileUrl = `/img/default.jpg`;
            this.artx = 0;
            this.arty = 0;
            this.artz = 1;
        }

    let art = PIXI.Sprite.from(artfileUrl);
        art.width = 240 * this.artz;
        art.height = 240 * this.artz;
        art.x = this.artx;
        art.y = 40 + this.arty;
        this.addChild(art);

        art.mask = artMask;
    
    if (!this.playtest) this.addChild(art);
    
    this.structures.image = art;



    //////////////////////////
    // Lower-Layer Graphics //
    //////////////////////////

    let g = new PIXI.Graphics();

    //Graphic fill color
    let bezelFill = this.playtest ? 0xffffff : 0x000000;

    //Top bezel
    g.beginFill(bezelFill);
    if (this.playtest) g.lineStyle(1, 0x000000, 1);
    g.moveTo(240,12);
    g.lineTo(240,40);
    g.lineTo(0,40);
    g.lineTo(0,12);
    g.arcTo(0,0,12,0,12);
    g.lineTo(228,0);
    g.arcTo(240,0,240,12,12);
    g.endFill();

    //Bottom bezel
    let bottomBezelTop = this.playtest ? 40 : 280;
    g.beginFill(bezelFill);
    g.moveTo(0,324);
    g.lineTo(0,bottomBezelTop);
    g.lineTo(240,bottomBezelTop);
    g.lineTo(240,324);
    g.arcTo(240,336,228,336,12);
    g.lineTo(12,336);
    g.arcTo(0,336,0,324,12);
    g.endFill();

    //Film perfs
    g.beginFill(bezelFill,.64);
    g.drawRect(220,40,20,220);
    g.endFill();
    
    g.beginFill(0xFFFFFF,.87);
    let px = 223, py = 42, pw = 14, ph = 9;
    for (var i=0; i<14; i++)
        g.drawRect(px,py+(i*16),pw,ph);
    g.endFill();

    this.addChild(g);

    //Gradient mask
    let gradient = PIXI.Sprite.from(`${context}img/gradient1.png`);
        gradient.x = 0;
        gradient.y = 180;
        gradient.width = 240;
        gradient.height = 100;
    if (!this.playtest) this.addChild(gradient);
    this.structures.gradient = gradient;

    if (this.type == "roll-the-credits") {
        gradient.y = 100;
        gradient.height = 180;
    }


    //////////////////////////
    // Upper-Layer Graphics //
    //////////////////////////

    let g2 = new PIXI.Graphics();

    //Color swash
    if (this.playtest) {
        g2.lineStyle(1,0x000000,1);
        g2.beginFill(0xFFFFFF, 1);
    }
    else {
        g2.beginFill(0xFFFFFF, .7);
    }

    if (this.type == 'extra') {
        g2.moveTo(38,16);
        g2.lineTo(38,280);
        g2.lineTo(240,280);
        g2.lineTo(240,310);
        g2.lineTo(6,310);
        g2.lineTo(6,16);
        g2.arcTo(6,4, 18,4, 12);
        g2.lineTo(26,4);
        g2.arcTo(38,4, 38,16, 12);
    }
    else {
        g2.moveTo(38,16);
        g2.lineTo(38,230);
        g2.lineTo(240,230);
        g2.lineTo(240,310);
        g2.lineTo(6,310);
        g2.lineTo(6,16);
        g2.arcTo(6,4, 18,4, 12);
        g2.lineTo(26,4);
        g2.arcTo(38,4, 38,16, 12);
    }

    g2.endFill();

    if (!this.playtest) g2.tint = colors[this.type];

    this.addChild(g2);
    this.structures.colorSwash = g2;

    if (this.type == "roll-the-credits") g2.visible = false;


    //Font Color
    let fontColor = this.playtest ? 0x000000 : 0xFFFFFF;
    
    ///////////////
    // Card Name //
    ///////////////

    let nameSetup = {
        lineHeight:14,
        fontFamily : 'Rockwell', 
        fontSize: 14, 
        fill : fontColor,
    };
    if (this.type == "special-effect" 
        || this.type == "plot-twist"
        || this.type == "extra")
        nameSetup = {
            wordWrap:true,
            align : 'center',
            wordWrapWidth:240,
            lineHeight:14,
            fontFamily : 'Rockwell', 
            fontSize: 14, 
            fill : fontColor,
        };
    let nameStyle = new PIXI.TextStyle(nameSetup);
    let name = new PIXI.Text(this.name,nameStyle);
        name.resolution = this.resolution;
        name.anchor.x = .5;
        name.anchor.y = .5;
        name.x = 136;
        name.y = 14;
    this.addChild(name);
    this.structures.name = name;

    //Shrink to fit
    while (name.width > 185) {
        nameStyle.fontSize -= .25;
    }

    if (this.type == "special-effect" 
        || this.type == "plot-twist"
        || this.type == "extra") name.y = 14+7;
    if (this.type == "roll-the-credits") name.visible = false;

    //ROLL THE CREDITS!
    //Name
    let rtc = new PIXI.Text("Roll The Credits!",
        new PIXI.TextStyle({
            fontFamily : 'Rockwell', 
            fontSize: 25, 
            fill : fontColor,
        }));
        rtc.resolution = this.resolution;
        rtc.anchor.x = .5;
        rtc.anchor.y = .5;
        rtc.x = 120;
        rtc.y = 21;
        rtc.visible = false;
    this.addChild(rtc);
    this.structures.rollTheCredits = rtc;

    if (this.type == "roll-the-credits") rtc.visible = true;



    ////////////////
    // Attributes //
    ////////////////

    let traitsStyle = new PIXI.TextStyle({
        align : 'center',
        fontFamily : 'Montserrat', 
        fontSize: 10, 
        fill : fontColor,
    });
    let traits = new PIXI.Text(this.traits.join(', '),traitsStyle);
    traits.resolution = this.resolution;
    traits.anchor.x = .5;
    traits.anchor.y = .5;
    traits.x = 136;
    traits.y = 28;
    this.addChild(traits);
    this.structures.traits = traits;

    while (traits.width > 185) {
        traits.style.fontSize -= .25;
    }

    if (this.type == "roll-the-credits"
        || this.type == "special-effect"
        || this.type == "plot-twist"
        || this.type == "extra") traits.visible = false;



    //////////////////
    // Popcorn Pips //
    //////////////////

    let popcorn = []; 
    let poptoggle = 5 - this.popcorn;
    for (var i=0; i<5; i++) {
        popcorn.push(PIXI.Sprite.from(`${context}img/popcorn.png`));
        popcorn[i].anchor.x = .5;
        popcorn[i].anchor.y = .5;
        popcorn[i].scale.set(.2);
        popcorn[i].x = 23;
        popcorn[i].y = 191 - (i*13);//139 + (i*13); //4*13 = 52
        popcorn[i].angle += 33*i;
        if (i < poptoggle 
            || this.type == "roll-the-credits"
            || this.type == "plot-twist"
            || this.type == "extra") popcorn[i].visible = false;
        this.addChild(popcorn[i]);
    }
    this.structures.popcorn = popcorn;



    ////////////////////
    // Popcorn bucket //
    ////////////////////

    let bucket = PIXI.Sprite.from(`${context}img/bucket.png`);
        bucket.anchor.x = .5;
        bucket.anchor.y = .5;
        bucket.scale.set(.13);
        bucket.x = 23;
        bucket.y = 215;
        if (!this.bucket 
            || this.type == "roll-the-credits"
            || this.type == "extra") bucket.visible = false;
        this.addChild(bucket);
        this.structures.bucket = bucket;


    //Need to IF these: ((??))

    ///////////////
    // Card Type //
    ///////////////

    let typeNameStyle = new PIXI.TextStyle({
        fontFamily : 'Montserrat', 
        fontSize: 13, 
        fill : fontColor,
        fontWeight:400,
        dropShadow:!this.playtest   ,
        dropShadowAlpha:1,
        dropShadowBlur:1,
        dropShadowDistance:2,
        dropShadowAngle:2
    });
    let typeName = new PIXI.Text(typeNames[this.type],typeNameStyle);
    typeName.angle = -90;
    typeName.resolution = this.resolution;
    typeName.anchor.x = .5;
    typeName.anchor.y = .5;
    typeName.x = 23;
    typeName.y = 85; 
    if (this.type=="special-effect") typeName.y -= 16;
    this.addChild(typeName);
    this.structures.typeName = typeName;




    //If a character, location, or creature:
    
    //////////
    // Stat //
    //////////

    let statStyle = new PIXI.TextStyle({
        wordWrap:true,
        align : 'center',
        fontFamily : 'Montserrat', 
        fontSize: 22.5, 
        fill : fontColor,
        fontWeight:600,
        dropShadow:!this.playtest,
        dropShadowAlpha:1,
        dropShadowBlur:1,
        dropShadowDistance:2
    });
    let stat = new PIXI.Text(this.stat,statStyle);
    stat.resolution = this.resolution;
    stat.anchor.x = .5;
    stat.x = 24;
    stat.y = 2;
    this.addChild(stat);
    this.structures.stat = stat;

    if ((""+this.stat).length > 2) stat.x -= 2;

    //Hide if Special Effect or Roll the Credits
    if (this.type == "special-effect" || this.type == "roll-the-credits")
        stat.visible = false;

    //Stat type
    let statType = new PIXI.Text(statText[this.type],new PIXI.TextStyle({
        wordWrap:true,
        align : 'center',
        fontFamily : 'Montserrat', 
        fontSize: 6, 
        fill : fontColor,
        fontWeight:400,
        dropShadow:!this.playtest,
        dropShadowAlpha:1,
        dropShadowBlur:1,
        dropShadowDistance:2
    }));
    statType.resolution = this.resolution;
    statType.anchor.x = .5;
    statType.x = 23;
    statType.y = 28;
    this.addChild(statType);
    this.structures.statType = statType;



    /////////////////////
    // Number & Siglum //
    /////////////////////

    let numText = new PIXI.Text(`${this.number}\n${this.siglum} • ${this.language}`,new PIXI.TextStyle({
        wordWrap:true,
        align : 'left',
        fontFamily : 'Avenir', 
        fontSize: 8, 
        fill : fontColor,
        fontWeight:400,
        lineHeight:8,
    }));
    numText.resolution = this.resolution;
    numText.anchor.x = 0;
    numText.x = 10;
    numText.y = 312;
    this.addChild(numText);
    this.structures.numText = numText;



    ///////////////////////
    // Mechanic & Artist //
    ///////////////////////

    let tex = `⚙ ${this.mechanic}\n✑ ${this.artist}`;
    if (this.type == "roll-the-credits") tex = `\n✑ ${this.artist}`;
    let artistText = new PIXI.Text(tex,new PIXI.TextStyle({
        wordWrap:true,
        align : 'right',
        fontFamily : 'Avenir', 
        fontSize: 8, 
        fill : fontColor,
        fontWeight:400,
        lineHeight:8,
    }));
    artistText.resolution = this.resolution;
    artistText.anchor.x = 1;
    artistText.x = 230;
    artistText.y = 312;
    this.addChild(artistText);
    this.structures.artistText = artistText;



    ////////////////
    // Title Word //
    ////////////////

    let titleText = new PIXI.Text(this.title,new PIXI.TextStyle({
        wordWrap:true,
        align : 'center',
        fontFamily : 'Avenir', 
        fontSize: 13, 
        fill : fontColor,
        fontWeight:400
    }));
    titleText.resolution = this.resolution;
    titleText.anchor.x = .5;
    titleText.anchor.y = 0;
    titleText.x = 120;
    titleText.y = 328;
    titleText.angle = 180;
    this.addChild(titleText);
    this.structures.titleText = titleText;



    /////////////
    // Website //
    /////////////

    let webText = new PIXI.Text(`graverobbersgame.com`,new PIXI.TextStyle({
        wordWrap:true,
        align : 'center',
        fontFamily : 'Avenir', 
        fontSize: 6.6, 
        fill : fontColor,
        fontWeight:200
    }));
    webText.resolution = this.resolution;
    webText.anchor.x = .5;
    webText.anchor.y = 0;
    webText.x = 120;
    webText.y = 324;
    this.addChild(webText);


    ///////////
    // Quote //
    ///////////
    
    let quoteStyle = new PIXI.TextStyle({
        wordWrap:true,
        wordWrapWidth:220,
        align : 'center',
        fontFamily : 'Avenir', 
        fontSize: 8.5, 
        fill : fontColor,
        fontWeight:600,
        fontStyle:"italic",
        dropShadow:false,
        dropShadowAlpha:1,
        dropShadowBlur:1.2,
        dropShadowDistance:1.5,
        padding:1
    });
    let quote = new PIXI.Text(this.quote,quoteStyle);
    quote.resolution = this.resolution;
    quote.anchor.x = .5;
    quote.x = 123;
    quote.y = 250;

    this.structures.quote;

    //Place the quote in the image frame
    if (this.type != "roll-the-credits") {
        //Fix location
        //220-38 = 182
        //38 + 182/2
        //=129
        quoteStyle.wordWrapWidth = 174;//180;
        quote.x = 129 - 2 +1;
        quote.y = 230 - quote.height - 2 -2 -1;

        //Subtitles 20% black
        if (!this.playtest) {

            let subX1 = 40;//38;
            let subX2 = 218;//220;
            let subY1 = quote.y-2 -2;
            let subY2 = 230 -2;

            let g3 = new PIXI.Graphics();
            g3.beginFill(0x000000, .65);
            g3.moveTo(subX1,subY1);
            g3.lineTo(subX1,subY2);
            g3.lineTo(subX2,subY2);
            g3.lineTo(subX2,subY1);
            g3.moveTo(subX1,subY1);

            this.addChild(g3);

            if (this.type == "extra") {
                g3.visible = false;
            }

        }
        else {
            //Turn on shadow if it's playtest
            quoteStyle.dropShadow = !this.playtest;
        }

        if (this.type == "extra") {
            quote.visible = false;
        }

    }

    this.addChild(quote);



    //////////////////
    // Ability Text //
    //////////////////

    window.abilitiesStyle = new PIXI.TextStyle({
        wordWrap:true,
        wordWrapWidth:220,
        breakWords: true,
        align : 'center',
        fontFamily : 'Montserrat', 
        fontSize: 10, 
        fill : fontColor,
        fontWeight:400,
        dropShadow:false, //Keep false here for calculating size, true later
        dropShadowAlpha:1.5,
        dropShadowBlur:1.4,
        dropShadowDistance:1.5
    });
    let abilities = new PIXI.Text(this.abilities,abilitiesStyle);
    abilities.resolution = this.resolution;
    abilities.anchor.x = .5;
    abilities.x = 123;
    abilities.y = 270;
    this.addChild(abilities);
    this.structures.abilities;

    if (this.type == 'roll-the-credits') abilities.visible = false;

    //Place the ability text in the ability box

    //Calc spacing
    //230-310
    let hStart = 232;
    let hEnd = 305;
    let minSpace = 4;

    //Total height
    let h0 = hEnd-hStart;

    //Height of abilities
    let h2 = (this.abilities.length > 0) ? abilities.height : 0;

    //Shrink to fit
    while ( (h2 + minSpace) > h0) {
        //Adjust abilities down
        abilitiesStyle.fontSize -= .1;
        //Height of abilities
        h2 = (this.abilities.length > 0) ? abilities.height : 0;
    }

    //Turn on shadow
    abilitiesStyle.dropShadow = !this.playtest;

    //Space remaining
    let remainder = h0 - h2;
    let spacer = Math.round(remainder/2);

    //quote.y = hStart + spacer;
    abilities.y = hStart + spacer;

} //END update()

}//END class Card