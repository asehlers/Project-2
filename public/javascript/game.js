
$(document).ready(function() {
	var myChar, opponentChar, choices, enemyArray, haveCharacter, haveAttacker, numEnemies, rounds;	//Set Global Variables
	var wins = 0;
	var loses = 0;

	function varSet() {		//Sets all of the variable values
		myChar;
		opponentChar;

		choices = [];

		// enemyArray = [ {
		// 	id: 0,
		// 	name: "Character 1",
		// 	pic: 'http://via.placeholder.com/100x175',
		// 	currentHP: 150,
		// 	attackBonus: 5
		// }, {
		// 	id: 1,
		// 	name: "Character 2",
		// 	pic: 'http://via.placeholder.com/100x175',
		// 	currentHP: 100,
		// 	attackBonus: 25 		
		// }, {
		// 	id: 2,
		// 	name: "Character 3",
		// 	pic: 'http://via.placeholder.com/100x175',
		// 	currentHP: 120,
		// 	attackBonus: 19 
		// }, {
		// 	id: 3,
		// 	name: "Character 4",
		// 	pic: 'http://via.placeholder.com/100x175',
		// 	currentHP: 140,
		// 	attackBonus: 9 
		// } ];

		$.get("/api/monsters").then(function(data){
			enemyArray = [];
			// console.log(data);
			// for(var j = 0; j < data.length; j++){
			// 	enemyArray.push(
			// 	{
			// 		id: data[j].id,
			// 		name: data[j].name,
			// 		image: data[j].image,
			// 		defaultHP: data[j].defaultHP,
			// 		attackBonus: data[j].attackBonus
			// 	});
			// }
			enemyArray =  data;
			haveCharacter = false;
			haveAttacker = false;
			numEnemies = 3;
			rounds = 7;

			for(var i = 0; i < enemyArray.length; i++) {
				choices += "<div id=" + enemyArray[i].id + " class='btn character text-center' value=" + enemyArray[i].id +
				"><img class='houses' src=" + enemyArray[i].image + " alt=" + enemyArray[i].name + "><br> HP: " + enemyArray[i].defaultHP +
				"<br> AP: " + enemyArray[i].attackBonus + " </div>";
			}

			$("#picking").html(choices);
			$("#todo").html("Click to choose your house");

			$('.hero').remove();
			$('.fighting').remove();
			$('#whathappens').html("");

			attachCharacterOnClick();
		});
	}

	function printCharacters() {
		var hero = "<div id=" + enemyArray[myChar].id + " class='btn character text-center hero' value=" + enemyArray[myChar].id +
			"><img class='houses' src=" + enemyArray[myChar].image + " alt=" + enemyArray[myChar].name + "><br> HP: " + enemyArray[myChar].currentHP +
			"<br> AP: " + enemyArray[myChar].attackBonus + " </div>";
		var badguy = "<div id=" + enemyArray[opponentChar].id + " class='btn character text-center fighting' value=" + enemyArray[opponentChar].id +
			"><img class='houses' src=" + enemyArray[opponentChar].image + " alt=" + enemyArray[opponentChar].name + "><br> HP: " + enemyArray[opponentChar].currentHP +
			"<br> AP: " + enemyArray[opponentChar].attackBonus + " </div>";
		$('#myguy').html(hero);
		$('#enemy').html(badguy);
	}

	function whatHappens() {
		var description = "You attack " + enemyArray[opponentChar].name + " for " + enemyArray[myChar].attackBonus + " damage!<br>" +
			enemyArray[opponentChar].name + " counter attacks for " + enemyArray[opponentChar].attackBonus + " damage!<br>" +
			"Your attack power has increased by " + rounds + "!";
		$('#whathappens').html(description);
	}

	function initiative(dexterity){
    var dexMod = (Math.floor((dexterity-10)/2));
    var result = (Math.floor(Math.random() * 20) + 1) + dexMod;
		console.log(result);
		return result;
}

	function attachCharacterOnClick() {
		$('.character').on("click", function(){
			if(!haveCharacter) {	//Picking your character
				myChar = $(this).attr('id')-1;
				$("#myguy").append(this);
				$(this).addClass("hero");

				haveCharacter = true;
				$('#whathappens').html("");
				$("#todo").html("Choose your opponent!");

				var id = $(this).attr('id');

				$.get("api/monsters/" + id, function (data) 
				{
					console.log(data);
						var characterone = {
								currentHP: data[0].defaultHP,
								initiative: data[0].dexterity,
								userControlled: true,
								MonsterId: id
						}
						enemyArray[myChar].currentHP = characterone.currentHP;
						enemyArray[myChar].initiative = characterone.initiative;
						enemyArray[myChar].userControlled = characterone.userControlled;
						$.post("api/new", characterone, function()
						{
							console.log(characterone);
								//reload page(with 1st character)
						});
				});
			}
			//You have a character and you're picking your opponent
			else if(!haveAttacker && haveCharacter && myChar !== $(this).attr('id')) {	
				opponentChar = $(this).attr('id')-1;
				$("#enemy").append(this);
				$(this).addClass("fighting");

				haveAttacker = true;
				$('#whathappens').html("");
				$("#todo").html("Keep clicking attack to duel!");

				var id = $(this).attr('id');

				$.get("api/monsters/" + id, function (data) 
				{
					console.log(data);
						var charactertwo = {
								currentHP: data[0].defaultHP,
								initiative: data[0].dexterity,
								userControlled: false,
								MonsterId: id
						}
						
						enemyArray[opponentChar].currentHP = charactertwo.currentHP;
						enemyArray[opponentChar].initiative = charactertwo.initiative;
						enemyArray[opponentChar].userControlled = charactertwo.userControlled;

						$.post("api/new", charactertwo, function()
						{
							console.log(charactertwo);
								//reload page(with 1st character)
						});
				});
			}
		});
	}

	function getRecord () {
		$.get("/api/user_data").then(function(data) {
			$("#winsloses").text("Player: " + data.email + " Wins: " + data.wins + " Losses: " + data.losses);
		});
	}

	$('#attack').on("click", function() {
		if(!haveCharacter) {
			$('#whathappens').html("You need to pick your house first!");
		}
		else if(!haveAttacker) {
			$('#whathappens').html("Pick who you are fighting!");
		}
		else if(haveCharacter && haveAttacker) {
			combatTurn(enemyArray[myChar], enemyArray[opponentChar]);

			rounds++;
			enemyArray[opponentChar].currentHP  = enemyArray[opponentChar].currentHP - enemyArray[myChar].attackBonus;	//Hit Them
			enemyArray[myChar].currentHP = enemyArray[myChar].currentHP - enemyArray[opponentChar].attackBonus;	//Get Hit


			if(enemyArray[opponentChar].currentHP < 0) {
				numEnemies--;
				if(numEnemies > 0) {
					$(".fighting").remove();
					$('#whathappens').html("");
					$("#todo").html("Who will you duel next?");
					haveAttacker = false;
				}
				else {
					whatHappens();
					alert("You win the house cup!  Play again!");
					wins++;
					$('#winsloses').html("Overall Wins: " + wins + "&nbsp;&nbsp;Loses: " + loses);
					varSet();
				}
				
			}
			else if(enemyArray[myChar].currentHP < 0) {
				whatHappens();
				alert("Your house has been defeated!  Try again!");
				loses++;
				$('#winsloses').html("Overall Wins: " + wins + "&nbsp;&nbsp;Loses: " + loses);
				varSet();
			}
			else {
				whatHappens();
				printCharacters();
			}

			enemyArray[myChar].attackBonus = enemyArray[myChar].attackBonus + rounds;	//Get Stronger
		}
	});

	$('#restart').on("click", function(){
		varSet();
		$.ajax({
      method: "DELETE",
			url: "/api/removeAllCombatants/"
    })
    .then(function() {
      console.log("worked?");
    });
	});

	attachCharacterOnClick();
	varSet();
	getRecord();
});

function initiative(){
	var dexMod = (Math.floor((dexterity-10)/2));
	var result = (Math.floor(Math.random() * 20) + 1) + dexMod;
	console.log(result);
}

function proficiency(challengeRating){
	var prof = (Math.floor((challengeRating - 1)/4) + 2);
	return prof;
}

function attackRoll(char1, char2){
 var prof = proficiency(char1.challengeRating);
 var strMod = (Math.floor((strength-10)/2));
 var result =  (Math.floor(Math.random() * 20) + 1) + prof + strMod;
	console.log(result);
	if (char2.attackRoll >= char1.dexterity){
			return [true, result];
	} else {
			return false;
	}
}

function damageRoll(char1, char2){
 var strMod = (Math.floor((strength-10)/2));
 var result =  (Math.floor(Math.random() * 20) + 1) + strMod;
	console.log(result);
	char1.currentHP-=(result);
}

function gameOver(){
	if (character1.currentHP <= 0){
			console.log("You have been defeated! Would you like to play again?");
			return true;
	}
	if (character2.currentHP <= 0){
			console.log("You have emerged victorious! Would you like to play again?");
			return true;
	}
}

function combatTurn(character1, character2){
	console.log(character1);
	console.log(character2);

	function initiativeResult(){
		if (character1.initiative < character2.initiative) {
			 return false;
		}
		else {
				return true;
		}
	}

	function gameOver(){
			if (character1.currentHP <= 0){
					console.log("You have been defeated! Would you like to play again?");
					return true;
			}
			if (character2.currentHP <= 0){
					console.log("You have emerged victorious! Would you like to play again?");
					return true;
			}
	}

	if (initiativeResult()){
			var attack = attackRoll(character1, character2)
			if (attack[0]){
					damageRoll(character1, character2);
			if (attack[1]===20){
					damageRoll(character1, character2);
					var strMod = (Math.floor((strength-10)/2));
					currentHP.character2 += strMod.character1;
			}

			var attack = attackRoll(character2, character1)
			if (!gameOver() && attack[0]){
							damageRoll(character2, character1);
					if (attack[1]===20){
							damageRoll(character2, character1);
							var strMod = (Math.floor((strength-10)/2));
							currentHP.character1 += strMod.character2;
					}
					}
	
					gameOver();
	}
	else {
			var attack = attackRoll(character2, character1)
			if (attack[0]){
					damageRoll(character2, character1);
			if (attack[1]===20){
					damageRoll(character2, character1);
					var strMod = (Math.floor((strength-10)/2));
					currentHP.character2 += strMod.character1;
			}
			}

		 var attack = attackRoll(character1, character2)
			if (!gameOver() && attack[0]){
							damageRoll(character1, character2);
					if (attack[1]===20){
							damageRoll(character1, character2);
							var strMod = (Math.floor((strength-10)/2));
							currentHP.character1 += strMod.character2;
					}
					}
			gameOver();
	}
}
}