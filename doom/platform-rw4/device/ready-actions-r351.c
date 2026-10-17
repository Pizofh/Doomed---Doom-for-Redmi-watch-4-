/* Included into the worker adapter. No UI thread invokes the engine. */
static void verify_wad(void)
{
    struct rw4_file *f=rw4_fopen(RW4_GAME_WAD,"rb");if(!f)rw4_exit(84);
    unsigned char b[8192];unsigned total=0;uint32_t c=0xffffffffu,table[256];
    for(unsigned i=0;i<256;i++){uint32_t v=i;for(unsigned j=0;j<8;j++)v=(v>>1)^((0u-(v&1u))&0xedb88320u);table[i]=v;}
    for(;;){size_t n=rw4_fread(b,1,sizeof(b),f);if(!n)break;if(n>4196020u-total)rw4_exit(84);total+=(unsigned)n;for(unsigned i=0;i<n;i++)c=(c>>8)^table[(c^b[i])&255u];}
    if(rw4_ferror(f)||rw4_fclose(f)||total!=4196020u||(c^0xffffffffu)!=371943786u)rw4_exit(84);
}
static void slot_action(void)
{
    unsigned action=rw4_slot_action_take();if(!action)return;
    if(gamestate!=GS_LEVEL||gameepisode!=1||gamemap<1||gamemap>9){rw4_slot_action_done(action,1);return;}
    if(action==8){
        save_stream=rw4_fopen(RW4_SLOT_PATH,"wb");if(!save_stream){rw4_slot_action_done(action,2);return;}
        savegame_error=false;P_WriteSaveGameHeader("RW4 DOOM");P_ArchivePlayers();P_ArchiveWorld();P_ArchiveThinkers();P_ArchiveSpecials();P_WriteSaveGameEOF();
        unsigned failed=savegame_error||rw4_ferror(save_stream);if(rw4_fclose(save_stream))failed=1;save_stream=NULL;
        rw4_slot_action_done(action,failed||!rw4_slot_valid()?3:0);
    }else{
        if(!rw4_slot_valid()){rw4_slot_action_done(action,4);return;}
        G_LoadGame(RW4_SLOT_PATH);G_DoLoadGame();
        /* The ordinary engine checks header/version and its end marker. */
        rw4_slot_action_done(action,savegame_error?5:0);
    }
}
