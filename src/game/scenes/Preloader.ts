import { Scene } from 'phaser';

export class Preloader extends Scene
{
    constructor ()
    {
        super('Preloader');
    }

    init ()
    {
        //  We loaded this image in our Boot Scene, so we can display it here
        this.add.image(512, 384, 'background');

        //  A simple progress bar. This is the outline of the bar.
        this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);

        //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
        const bar = this.add.rectangle(512-230, 384, 4, 28, 0xffffff);

        //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
        this.load.on('progress', (progress: number) => {

            //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
            bar.width = 4 + (460 * progress);

        });
    }

    preload ()
    {
        //  Load the assets for the game - Replace with your own assets
        this.load.setPath('assets');

        this.load.image('logo', 'logo.png');
        this.load.image('star', 'star.png');

        this.load.image('grey', 'map/grey.png');
        this.load.image('wall', 'map/wall.png');
        this.load.image('nothing', 'nothing.png')
        
        this.load.image('player', 'player/player1.png');

        //weapons
        this.load.image('wireplacer', 'player/wire_placer.png');
        this.load.image('tazer', 'player/tazer.png');
        this.load.image('netshooter', 'player/net_shooter.png');
        this.load.image('net', 'player/net.png');

        //critters
        this.load.image('blue', 'critters/blue.png');

        //wires
        this.load.image('horizontalwire', 'map/horizontalwire.png');
        this.load.image('verticalwire', 'map/verticalwire.png');
        this.load.image('crosswire', 'map/crosswire.png');

        this.load.image('generator', 'map/generator.png');

        const red = this.add.graphics();
        red.fillStyle(0xff0000, 0.3);
        red.fillRect(0,0,32,32);
        red.generateTexture('redhighlight', 32,32);
        red.destroy();


        //general
        const circle32 = this.add.graphics();
        circle32.fillStyle(0xffffff, 1);
        circle32.fillCircle(16,16, 16);
        circle32.generateTexture('circle32', 32, 32);

        const circle6 = this.add.graphics();
        circle32.fillStyle(0xffffff, 1);
        circle32.fillCircle(3,3, 3);
        circle32.generateTexture('circle6', 6, 6);

        //turret
        this.load.image('turret_cannon', 'turret/cannon.png');
        this.load.image('turret_tazer_spout', 'turret/tazer_spout.png');

        /*
        const player_graphics = this.add.graphics();
        player_graphics.fillStyle(0x00ff00);
        player_graphics.fillCircle(10, 10, 10);
        player_graphics.generateTexture('player', 20, 20)
        player_graphics.destroy();
        */
    }

    create ()
    {
        //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
        //  For example, you can define global animations here, so we can use them in other scenes.

        //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
        this.scene.start('GridTest');
        //this.scene.start('MainMenu');
    }
}
