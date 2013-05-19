$(document).ready(function(){
  // ���C�����W�b�N
  var main_logic = function(){
    window.m4w.screen.sprites[1].move({dx:1,dy:0});
  };

  // �A�Z�b�g���[�h�I�����̏���
  // �E���C�����W�b�N�̓o�^
  // �E�{�^���������̏����̒ǉ�
  var on_ready = function(assets){
    window.m4w.screen.sprites.push(assets.sprite.s01);
    window.m4w.main_logic = main_logic;
    $("#button1").on("click", function(){
      window.m4w.screen.sprites[1].move({dx:0,dy:4});
    });
  }

  // M4W�̏�����
  var body = $("#game");
  body.m4w();
  
  // �^�C�}�[�E�J�E���g�\�����X�v���C�g�Ƃ��Ď���
  // (�{���́A���C�����W�b�N�ɓ����ׂ������A�X�v���C�g�̉��p��Ƃ��Ď���)
  window.count = 0;
  body.m4w.screen.sprites.push({
    render: function(ctx){
      window.count++;
      $("#message2").html("Time: "+(new Date()).getTime() + "/ Count: " + window.count);
    }
  });
  
  // �X�^�[�g���̎��Ԃ�\��
  $("#message1").html("Time: "+(new Date()).getTime());
  // �A�Z�b�g�̃��[�h
  AssetsLoader.load({
    assets: [{type: "sprite", id: "s01", src:"img/sampleimage.gif"}],
    success: on_ready
  });
  
  // ���C�����[�v�̊J�n
  window.m4w.main_loop();
  
  // 10�b��Ƀ��C�����[�v���I������悤�ɐݒ�
  window.setTimeout(window.m4w.stop_main_loop, 10000);
});
