.. _algorithms:

===============
Algorithms used
===============

The list of algorithms used in shapewars application

.. _start:
-----
Start
-----

1. Starting the game with adjusting foreground/middleground/background
2. Detect current player
3. generate globals & resize window
4. Setup listeners (detect if mobile/tablet and readjust):

    * resize
    * mouseup
    * if mobile:

        - touchstart
        - touchend

    * if pc:

        - keydown
        - mousedown

5. Render background
6. Run main loop (frame)


.. _main-loop:
---------
Main loop
---------

Operations performed in main loop:

1. Logic update

    * takeover phase
    * minion generation phase
    * .. todo:: implement minion movement phase

2. Render update

    * .. todo:: redraw attack arrows
    * redraw takeover progress
    * .. todo:: redraw minions


-----
Order
-----



------
Attack
------

-------
Defence
-------

