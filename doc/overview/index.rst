.. _overview:

========
Overview
========

This is overwiew of shapewars application


.. todo:: I have to make procedurally-generated fields...

.. todo:: Allow for a couple of fields attack one field

.. todo:: apply health to minions

.. todo:: add minion movements

.. todo:: after a minute order may change:

    * conquer everything
    * conquer a player
    * can't attack a player
    * can't attack neutral
    * conquer specific field?

----------
Map object
----------

* 0-7 - values reserved for players
* 8 - square which is unavailable to reach
* 9 - suqare availible to be conquered

-------------
Player object
-------------

* ``name`` - player name
* ``color`` - player color
* ``type`` - player type:

    - 0 - current player
    - 1 - enemy human
    - 2 - enemy AI

------------
Owned object
------------
