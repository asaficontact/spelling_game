<!-- src/routes/Game.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import { wordList } from '$lib/stores';
	import { Button } from 'flowbite-svelte';

	let canvas: HTMLCanvasElement;
	let ctx: any;
	let createUnitBtn: HTMLElement;
	let getMeatBtn: HTMLElement;
	let meatCountDiv: HTMLElement;
	let unitSelection: HTMLElement;

	export let game: any = writable(null);

	onMount(() => {
		canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
		ctx = canvas.getContext('2d');
		createUnitBtn = document.getElementById('createUnitBtn') as HTMLElement;
		getMeatBtn = document.getElementById('getMeatBtn') as HTMLElement;
		meatCountDiv = document.getElementById('meatCount') as HTMLElement;
		unitSelection = document.getElementById('unitSelection') as HTMLElement;
		initGame();
	});

	interface ImageMap {
		[key: string]: ImageItem;
	}
	interface ImageItem {
		idle: HTMLImageElement | null;
		attack: HTMLImageElement | null;
	}

	let images: ImageMap = {
		Basic: { idle: null, attack: null },
		Tank: { idle: null, attack: null },
		Scout: { idle: null, attack: null },
		Steve: { idle: null, attack: null },
		Sammie: { idle: null, attack: null }
	};

	function loadImage(src: string) {
		return new Promise((resolve, reject) => {
			const img = new Image();
			img.onload = () => resolve(img);
			img.onerror = reject;
			img.src = src;
		});
	}

	async function loadAllImages() {
		const imagePromises = [
			loadImage('/images/basic_idle.gif').then(
				(img) => (images.Basic.idle = img as HTMLImageElement)
			),
			loadImage('/images/basic_attack.gif').then(
				(img) => (images.Basic.attack = img as HTMLImageElement)
			),
			loadImage('/images/tank_idle.gif').then(
				(img) => (images.Tank.idle = img as HTMLImageElement)
			),
			loadImage('/images/tank_attack.gif').then(
				(img) => (images.Tank.attack = img as HTMLImageElement)
			),
			loadImage('/images/scout_idle.gif').then(
				(img) => (images.Scout.idle = img as HTMLImageElement)
			),
			loadImage('/images/scout_attack.gif').then(
				(img) => (images.Scout.attack = img as HTMLImageElement)
			),
			loadImage('/images/steve_idle.gif').then(
				(img) => (images.Steve.idle = img as HTMLImageElement)
			),
			loadImage('/images/steve_attack.gif').then(
				(img) => (images.Steve.attack = img as HTMLImageElement)
			),
			loadImage('/images/sammie_idle.gif').then(
				(img) => (images.Sammie.idle = img as HTMLImageElement)
			),
			loadImage('/images/sammie_attack.gif').then(
				(img) => (images.Sammie.attack = img as HTMLImageElement)
			)
		];
		await Promise.all(imagePromises);
	}

	class Castle {
		x: number;
		y: number;
		color: string;
		health: number;
		maxHealth: number;
		width: number;
		height: number;
		isPlayer: boolean;
		constructor(
			x: number,
			y: number,
			color: string,
			health: number = 500,
			isPlayer: boolean = true
		) {
			this.x = x;
			this.y = y;
			this.color = color;
			this.health = health;
			this.maxHealth = health;
			this.width = 80;
			this.height = 120;
			this.isPlayer = isPlayer;
		}

		draw() {
			// Main castle body
			ctx.fillStyle = this.color;
			ctx.fillRect(this.x, this.y, this.width, this.height);

			// Castle top
			ctx.beginPath();
			ctx.moveTo(this.x, this.y);
			ctx.lineTo(this.x + this.width / 2, this.y - 30);
			ctx.lineTo(this.x + this.width, this.y);
			ctx.closePath();
			ctx.fill();

			// Windows
			ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
			ctx.fillRect(this.x + 10, this.y + 30, 20, 30);
			ctx.fillRect(this.x + 50, this.y + 30, 20, 30);

			// Health bar
			ctx.fillStyle = 'red';
			ctx.fillRect(this.x, this.y - 40, this.width, 10);
			ctx.fillStyle = 'green';
			ctx.fillRect(this.x, this.y - 40, this.width * (this.health / this.maxHealth), 10);
		}
	}

	class Unit {
		x: number;
		y: number;
		type: string;
		power: number;
		speed: number;
		range: number;
		health: number;
		maxHealth: number;
		cost: number;
		name: string;
		width: number;
		height: number;
		lastAttackTime: number;
		isPlayer: boolean;
		isAttacking: boolean;
		attackAnimationStart: number;

		constructor(
			x: number,
			y: number,
			type: string,
			power: number,
			speed: number,
			range: number,
			health: number,
			cost: number,
			name: string,
			isPlayer: boolean = true
		) {
			this.x = x;
			this.y = y;
			this.type = type;
			this.power = power;
			this.speed = speed;
			this.range = range;
			this.health = health;
			this.maxHealth = health;
			this.cost = cost;
			this.name = name;
			this.width = 60; // Adjust based on your GIF size
			this.height = 60; // Adjust based on your GIF size
			this.lastAttackTime = 0;
			this.isPlayer = isPlayer;
			this.isAttacking = false;
			this.attackAnimationStart = 0;
		}

		move(enemyCastle: any) {
			if (this.isPlayer) {
				if (this.x + this.width + this.range < enemyCastle.x) {
					this.x += this.speed;
				}
			} else {
				if (this.x - this.range > enemyCastle.x + enemyCastle.width) {
					this.x -= this.speed;
				}
			}
		}

		draw(ctx: any) {
			const image =
				this.isAttacking && Date.now() - this.attackAnimationStart < 500
					? images[this.type].attack
					: images[this.type].idle;

			ctx.save();
			if (!this.isPlayer) {
				ctx.scale(-1, 1);
				ctx.translate(-this.x - this.width, 0);
			} else {
				ctx.translate(this.x, 0);
			}
			ctx.drawImage(image, 0, this.y, this.width, this.height);
			ctx.restore();

			ctx.fillStyle = 'red';
			ctx.fillRect(this.x, this.y - 10, this.width, 5);
			ctx.fillStyle = 'green';
			ctx.fillRect(this.x, this.y - 10, this.width * (this.health / this.maxHealth), 5);
		}

		canAttack() {
			return Date.now() - this.lastAttackTime > 1000; // Attack every 1 second
		}

		attack(target: any) {
			if (this.canAttack()) {
				target.health -= this.power;
				this.lastAttackTime = Date.now();
				this.isAttacking = true;
				this.attackAnimationStart = Date.now();
				setTimeout(() => {
					this.isAttacking = false;
				}, 500);
				if (target.health <= 0) {
					return true; // Target is destroyed
				}
			}
			return false;
		}

		isInRange(target: any) {
			if (this.isPlayer) {
				return target.x - (this.x + this.width) <= this.range;
			} else {
				return this.x - target.x - target.width <= this.range;
			}
		}
	}

	function updateMeatCount(meatValue: number) {
	    const meatCountDiv = document.getElementById('meatCount') as HTMLElement;
	    meatCountDiv.textContent = `Meat: ${meatValue}`;
	}

	class Player {
		castle: Castle;
		units: Unit[];
		meat: number;
		isHuman: boolean;
		constructor(castle: Castle, isHuman: boolean = true) {
			this.castle = castle;
			this.units = [];
			this.meat = isHuman ? 0 : Infinity;
			this.isHuman = isHuman;
		}

		createUnit(unitType: Unit) {
			if (this.meat >= unitType.cost) {
				this.meat -= unitType.cost;
				const x = this.isHuman ? this.castle.x + this.castle.width : this.castle.x - unitType.width;
				const y = this.castle.y + this.castle.height / 2;
				const newUnit = new Unit(
					x,
					y,
					unitType.type,
					unitType.power,
					unitType.speed,
					unitType.range,
					unitType.health,
					unitType.cost,
					unitType.name,
					this.isHuman
				);
				this.units.push(newUnit);
				if (this.isHuman) {
					updateMeatCount(this.meat);
				}
			}
		}
	}

	async function initializeServer(playerId: string) {
		// TODO: Update function so that it receives the return from the server
		await fetch('/api/game', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ playerId })
		});
		return playerId as string;
	}

	class Game {
		playerId: string;
		player: Player;
		computer: Player;
		difficulty: number;
		unitTypes: Unit[];
		selectedUnitIndex: number;
		isPaused: boolean;
		currentWord: string;
		totalScore: number;
    		gameCount: number;

		constructor() {
			this.playerId = Math.random().toString(36).substring(7);
			this.initialize();
			this.resetGame();
			this.unitTypes = [
				new Unit(0, 0, 'Basic', 1, 1, 1, 1, 1, 'basic'),
				new Unit(0, 0, 'Tank', 2, 0.5, 60, 4, 2, 'tank'),
				new Unit(0, 0, 'Scout', 1, 2.5, 40, 1, 2, 'scout'),
				new Unit(0, 0, 'Sammie', 1, 0.2, 90, 2, 2, 'sammie'),
				new Unit(0, 0, 'Steve', 3, 1, 30, 4, 3, 'steve')
			];
			this.selectedUnitIndex = 0;
			this.createUnitButtons();
			this.isPaused = false;
			this.currentWord = '';
			this.totalScore = 0;
			this.gameCount = 0;
		}

	    	resetGame() {
			this.player = new Player(new Castle(50, canvas.height - 150, '#8B4513', 100, true));
		        this.computer = new Player(
		            new Castle(canvas.width - 130, canvas.height - 150, '#4682B4', 100, false),
		            false
		        );
		        this.difficulty = 0.02 + (this.gameCount * 0.005); // Increase difficulty with each game
		        this.player.meat = 0;
		        updateMeatCount(this.player.meat);
		    }


		async initialize() {
			this.playerId = await initializeServer(this.playerId);
		}

		startSpellingQuiz() {
			this.isPaused = true;
			this.currentWord = wordList[Math.floor(Math.random() * wordList.length)];
			console.log('answer:', this.currentWord);

			// Create and show the spelling quiz interface
			const quizContainer = document.createElement('div');
			quizContainer.id = 'quizContainer';
			quizContainer.style.position = 'absolute';
			quizContainer.style.top = '50%';
			quizContainer.style.left = '50%';
			quizContainer.style.transform = 'translate(-50%, -50%)';
			quizContainer.style.backgroundColor = 'white';
			quizContainer.style.padding = '20px';
			quizContainer.style.borderRadius = '10px';
			quizContainer.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';

			quizContainer.innerHTML = `
          <h2>Spell the word:</h2>
          <input type="text" id="spellingInput" autocomplete="off" spellcheck="false" style="font-size:25px;">
          <br><br>
          <button id="submitSpelling">Done</button>
          <button id="sayAgain">Say Word Again</button>
        `;

			document.body.appendChild(quizContainer);

			const submitButton = document.getElementById('submitSpelling') as HTMLElement;
			const spellingInput = document.getElementById('spellingInput') as HTMLElement;
			const sayAgainButton = document.getElementById('sayAgain') as HTMLElement;

			// Use text-to-speech to pronounce the word
			const speech = new SpeechSynthesisUtterance(this.currentWord);

			submitButton.addEventListener('click', () => this.checkSpelling());
			sayAgainButton.addEventListener('click', () => window.speechSynthesis.speak(speech));
			spellingInput.addEventListener('keypress', (e) => {
				if (e.key === 'Enter') {
					this.checkSpelling();
				}
			});

			window.speechSynthesis.speak(speech);
		}

		checkSpelling() {
			const spellingInput = document.getElementById('spellingInput') as HTMLInputElement;
			const userSpelling = spellingInput.value.trim().toLowerCase();

			if (userSpelling === this.currentWord) {
				this.player.meat += 20;
				updateMeatCount(this.player.meat);
				this.sendResultToServer(0, 20, this.currentWord, true);
				//alert('Correct! You earned 20 meat.');
			} else {
				alert(`Sorry, that's incorrect. The correct spelling is: ${this.currentWord}`);
				this.sendResultToServer(0, 0, this.currentWord, false);
			}

			// Remove the quiz container and unpause the game
			document.body.removeChild(document.getElementById('quizContainer') as HTMLElement);
			this.isPaused = false;
		}

		async sendResultToServer(score: number, meatCount: number, word: string, isCorrect: boolean) {
			await fetch('/api/game', {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					playerId: this.playerId,
					score: score,
					additionalMeatCount: meatCount,
					word,
					isCorrect
				})
			});
		}

		createUnitButtons() {
			this.unitTypes.forEach((unit, index) => {
				const button = document.createElement('div');
				button.className = 'unitButton';
				button.style.backgroundImage = `url('/images/${unit.name.toLowerCase()}_idle.gif')`;
				button.style.backgroundSize = 'cover';
				button.innerHTML = `${unit.name}<br>Cost: ${unit.cost}`;
				button.addEventListener('click', () => this.selectUnit(index));
				unitSelection.appendChild(button);
			});
			this.updateUnitButtonSelection();
		}

		selectUnit(index: number) {
			this.selectedUnitIndex = index;
			this.updateUnitButtonSelection();
		}

		updateUnitButtonSelection() {
			const buttons = unitSelection.getElementsByClassName('unitButton');
			for (let i = 0; i < buttons.length; i++) {
				buttons[i].classList.toggle('selected', i === this.selectedUnitIndex);
			}
		}

		update() {
			if (this.isPaused) return;

			// Move units
			this.player.units.forEach((unit) => unit.move(this.computer.castle));
			this.computer.units.forEach((unit) => unit.move(this.player.castle));

			// Computer creates units
			if (Math.random() < this.difficulty) {
				const randomUnit = this.unitTypes[Math.floor(Math.random() * this.unitTypes.length)];
				this.computer.createUnit(randomUnit);
			}

			// Combat logic
			this.combat(this.player, this.computer);
			this.combat(this.computer, this.player);

			// Remove destroyed units
			this.player.units = this.player.units.filter((unit) => unit.health > 0);
			this.computer.units = this.computer.units.filter((unit) => unit.health > 0);

			// Check for game over
			if (this.player.castle.health <= 0 || this.computer.castle.health <= 0) {
				this.gameOver();
			}
		}

		combat(attacker: Player, defender: Player) {
			attacker.units.forEach((unit) => {
				// Check if unit can attack the enemy castle
				if (unit.isInRange(defender.castle)) {
					if (unit.attack(defender.castle)) {
						console.log(`${attacker.isHuman ? 'Player' : 'Computer'} destroyed the enemy castle!`);
					}
				} else {
					// Check if unit can attack enemy units
					for (let i = 0; i < defender.units.length; i++) {
						const enemyUnit = defender.units[i];
						if (unit.isInRange(enemyUnit)) {
							if (unit.attack(enemyUnit)) {
								console.log(
									`${attacker.isHuman ? 'Player' : 'Computer'} unit destroyed an enemy unit!`
								);
								defender.units.splice(i, 1);
								i--;
							}
							break; // Only attack one enemy unit
						}
					}
				}
			});
		}

		async gameOver() {
		        let score;
		        let message;
		
		        if (this.player.castle.health > 0) {
		            score = this.player.castle.health;
		            this.totalScore += score;
		            this.gameCount++;
		            message = `Congratulations! You won game ${this.gameCount}!\nScore this game: ${score}\nTotal score: ${this.totalScore}\n\nPrepare for a harder challenge!`;
		            await this.sendResultToServer(score, 0, 'game_win', true);
		            alert(message);
		            this.resetGame(); // Start a new game with increased difficulty
		        } else {
		            score = -1 * this.computer.castle.health;
		            message = `Game Over! The computer wins.\nFinal score: ${this.totalScore}\nYou won ${this.gameCount} games in a row!`;
		            await this.sendResultToServer(this.totalScore, 0, 'game_over', false);
		            alert(message);
		            // Reset the entire game series
		            this.totalScore = 0;
		            this.gameCount = 0;
		            this.resetGame();
		        }
		    }

		draw() {
			// Draw background
			ctx.fillStyle = '#87CEEB'; // Sky blue
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			// Draw ground
			ctx.fillStyle = '#228B22'; // Forest green
			ctx.fillRect(0, canvas.height - 50, canvas.width, 50);

			this.player.castle.draw();
			this.computer.castle.draw();
			this.player.units.concat(this.computer.units).forEach((unit) => unit.draw(ctx));
		}
	}

	function gameLoop() {
	    game.update($game => {
	        $game.update();
	        $game.draw();
	        return $game;
	    });
	    requestAnimationFrame(gameLoop);
	}

	async function initGame() {
		game.set(new Game());
		gameLoop();
	}

	function createUnit() {
		if (!$game.isPaused) {
			$game.player.createUnit($game.unitTypes[$game.selectedUnitIndex]);
		}
	}

	function getMeat() {
		if (!$game.isPaused) {
			$game.startSpellingQuiz();
		}
	}

	async function handleLogout() {
		try {
			const response = await fetch('/logout', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				}
			});
			if (response.ok) {
				window.location.href = '/login';
			} else {
				console.error('Failed to logout:', response);
			}
		} catch (error) {
			console.error('Error during logout:', error);
		}
	}
</script>

<div>
	<h1>Spelling Castle Game</h1>
	<canvas id="gameCanvas" width="800" height="400"></canvas>
	<div id="gameControls">
		<Button color="green" size="sm" on:click={createUnit}>Create Unit</Button>
		<Button color="green" size="sm" on:click={getMeat}>Get Meat</Button>
		<Button color="red" size="sm" on:click={handleLogout}>Logout</Button>
	</div>
	<div id="meatCount">Meat: 0</div>
	<div id="unitSelection">
		<!-- Unit buttons will be added here dynamically -->
	</div>
</div>

<style>
	:global(body) {
		font-family: Arial, sans-serif;
		display: flex;
		flex-direction: column;
		align-items: center;
		background-color: #f0f0f0;
		margin: 0;
		padding: 20px;
	}
	#gameCanvas {
		border: 2px solid #333;
		border-radius: 10px;
		box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
	}
	#gameControls {
		margin-top: 20px;
		display: flex;
		gap: 10px;
	}
	button {
		padding: 10px 20px;
		font-size: 16px;
		cursor: pointer;
		background-color: #4caf50;
		color: white;
		border: none;
		border-radius: 5px;
		transition: background-color 0.3s;
	}
	button:hover {
		background-color: #45a049;
	}
	#meatCount {
		font-size: 18px;
		font-weight: bold;
		margin-top: 10px;
	}
	#unitSelection {
		margin-top: 20px;
		display: flex;
		gap: 10px;
	}
	:global(.unitButton) {
		width: 60px;
		height: 60px;
		border: 2px solid #333;
		border-radius: 5px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: transform 0.1s;
		background-size: cover;
		color: black;
		text-shadow: 1px 1px 2px grey;
		font-size: 12px;
		text-align: center;
	}
	:global(.unitButton:hover) {
		transform: scale(1.05);
	}
	:global(.unitButton.selected) {
		border-color: #4caf50;
		box-shadow: 0 0 5px #4caf50;
	}
</style>
