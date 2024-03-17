⬜ erro ou result ? quando o expect falha

⬜ capturar console.log

⬜ validar sintaxe do código antes de enviar pro sandbox

⬜ consigo melhorar o util.inspect ? => secundário


✅ Tirar as aspas quando usa format():
  - inspect("a") ====> 'a'
  - format("a")  ====> a


⬜ "soma is not defined" => consigo diferenciar erro interno de erro do aluno ?
  - erro do aluno: acontece nas primeiras linhas do código, não no meu código
  - exceto:
    - erro de sintaxe => resolver fazendo lint antes de executar
    - falta de definição da função => por default aparece no meu código, 
      preciso checar antes de executar



⬜ posso ter exercícios onde não requer que o aluno escreva uma função
=> daí não quero forçar o teste de "soma is not defined", mas também
não quero que em todo código de teste eu precise explicitamente pedir pra checar