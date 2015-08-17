.. _algorithms:

===============
Algorithms used
===============

The list of algorithms used in shapewars application

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

---------
Main loop
---------

Operations performed in main loop:

1. Logic update

    * takeover phase
    * minion generation phase
    * minion movement phase - TODO

2. Render update

    * redraw attack arrows - TODO
    * redraw takeover progress
    * redraw minions - TODO


-----
Order
-----



------
Attack
------

-------
Defence
-------

