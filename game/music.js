var SOUNDS = function () {
    // create the audio context
    var ac = typeof AudioContext !== 'undefined' ? new AudioContext : new webkitAudioContext,
        // get the current Web Audio timestamp (this is when playback should begin)
        when = ac.currentTime,
        // set the tempo
        tempo = 160,
        // initialize some vars
        sequence1,
        sequence2,
        sequence3,
        // create an array of "note strings" that can be passed to a sequence
        lead = [
            'G3 e',
            'F3 e',
            'E3 e',
            'F3 e',
            'G3 e',
            'D3 e',
            'C3 s',
            'E3 s',
            'G3 q',

            'G3 e',
            'E3 e',
            'E3 e',
            'F3 e',
            'D3 e',
            'D3 e',
            'C3 s',
            'E3 s',
            'C3 q',

  ],
        harmony = [

  ],
        bass = [
            'G2 q',
            'E2 q',
            'D2 q',
            'E2 q',
            'G2 q',
            'E2 q',
            'C2 q',
            'E2 q',
  ];

    // create 3 new sequences (one for lead, one for harmony, one for bass)
    sequence1 = new Sequence(ac, tempo, lead);
    sequence2 = new Sequence(ac, tempo, harmony);
    sequence3 = new Sequence(ac, tempo, bass);

    // set staccato and smoothing values for maximum coolness
    sequence1.staccato = 0.55;
    sequence2.staccato = 0.55;
    sequence3.staccato = 0.05;
    sequence3.smoothing = 0.4;

    // adjust the levels so the bass and harmony aren't too loud
    sequence1.gain.gain.value = 0.1 / 4;
    sequence2.gain.gain.value = 0.04 / 4;
    sequence3.gain.gain.value = 0.06 / 4;

    // apply EQ settings
    sequence1.mid.frequency.value = 800;
    sequence1.mid.gain.value = 3;
    sequence2.mid.frequency.value = 1200;
    sequence3.mid.gain.value = 3;
    sequence3.bass.gain.value = 6;
    sequence3.bass.frequency.value = 80;
    sequence3.mid.gain.value = -6;
    sequence3.mid.frequency.value = 500;
    sequence3.treble.gain.value = -2;
    sequence3.treble.frequency.value = 1400;

    function playMusic() {
        when = ac.currentTime;
        //start the lead part immediately
        sequence1.play(when);
        // delay the harmony by 16 beats
        //sequence2.play(when + (60 / tempo) * 32);
        //sequence2.play(when);
        // start the bass part immediately
        //sequence3.play(when + (60 / tempo) * 16);
        sequence3.play(when);
    }

    function stopMusic() {
        sequence1.stop();
        sequence2.stop();
        sequence3.stop();
    }

    return {
        "start_music": function () {
            playMusic();
        },
        "stop_music": function () {
            stopMusic();
        }
    }
}

var MUSIC = new SOUNDS();
MUSIC.start_music();
