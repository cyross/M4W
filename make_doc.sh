JSDOCDIR=${HOME}/app/jsdoc-toolkit
TEMPLATEDIR=${JSDOCDIR}/templates/jsdoc
OUTDIR=doc
CWD=`pwd`
java -Djsdoc.dir=${JSDOCDIR} -jar ${JSDOCDIR}/jsrun.jar ${JSDOCDIR}/app/run.js -t=${TEMPLATEDIR} -r=4 -d=${OUTDIR} -a jquery.m4w.js jquery.m4w.sound.js jquery.m4w.video.js jquery.m4w.sprite_ex.js jquery.m4w.drawer.js jquery.m4w.webgl.js jquery.m4w.physics.js
