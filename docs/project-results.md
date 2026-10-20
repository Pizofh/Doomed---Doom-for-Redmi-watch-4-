# Results and limits

Doomed progressed from emulator experiments to a playable native port on stock Redmi Watch 4 firmware. The main work covered firmware bindings, bounded memory, cooperative module lifetime, authenticated transfer, direct rendering, packed game data, save/load and sound effects.

## Evidence

- The owner confirmed original menus, movement, interaction, weapon switching, pause, save/load across reopenings and CLOSED exits in the DOOM II line.
- An earlier shareware build survived an approximately 30-minute user session, including death and restoring a save. This is not an endurance result for every later version.
- Local model tests exercised all 32 DOOM II maps; a physical campaign playthrough remains unverified.
- TouchID identified Chipone ICNT8918. The delivered port remains single touch; no driver modification was attempted.
- R405 corrects intermission input mapping. Installation is confirmed; map-end gameplay acceptance is pending.

## Remaining work

Sound can stutter; music and concurrent touch controls are absent. MENU/PAUSA visibility needs improvement. Fresh-machine builds and a second-owner installation flow are not validated. Compatibility is limited to the tested model/firmware.

The public documentation keeps architecture, practical use, results and limitations. Intermediate trial notes stay in the development checkout rather than the compact export.
