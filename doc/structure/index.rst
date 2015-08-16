.. _structure:

=========
Structure
=========

Shapewars application can be splitted into a couple of types of files. Those are:

* :ref:`Generation files <generation-files>`.
* :ref:`Listener files <listener-files>`.
* :ref:`Order files <order-files>`.
* :ref:`Logic files <logic-files>`.
* :ref:`Render files <render-files>`.

.. _generation-files:

----------------
Generation files
----------------

Prefix: ``generate``

Generator files are responsible for graphics generation files. This includes:

* minions (generated per player)
* background squares (generated per background square type + players owning specific type of background square)
* Takeover squares (generated per player)

Generator files must be saved into memory and drawn later


.. _listener-files:

--------------
Listener files
--------------

Prefix: ``listener``

Listeners are responsible for detection of js events:

* window resize
* mouse button up
* for mobile:

    * touchstart event
    * touchend event
    * touchemove event

* for pc/mac/linux:

    * keydown event
    * mousedown event
    * mousemove event


.. _order-files:

-----------
Order files
-----------

Prefix: ``order``

Orders are responsible for giving commands to minions and decision-making for those orders


.. _logic-files:

-----------
Logic files
-----------

Prefix: ``logic``


.. _render-files:

------------
Render files
------------

Prefix: ``render``

