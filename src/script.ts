declare const Chart: any;
const category = document.querySelector('#category') as HTMLSelectElement;
const statement = document.querySelector('#statement') as HTMLInputElement;
const amount = document.querySelector('#amount') as HTMLInputElement;
const date = document.querySelector('#date') as HTMLInputElement;
const transaction = document.querySelector('#transaction') as HTMLElement;
const incomeTrans = document.querySelector('#income') as HTMLElement;
const expenseTrans = document.querySelector('#expense') as HTMLElement;
const balance = document.querySelector('#totalBal') as HTMLElement;
const ctx1 = document.getElementById('myChart1') as HTMLCanvasElement;
const ctx2 = document.getElementById('myChart2') as HTMLCanvasElement;
const form = document.querySelector('#form') as HTMLFormElement;

const myChart = {
	myIncomeChart: null,
	myExpenseChart: null,
};
const expenseColor: readonly string[] = [
	'#fda4af',
	'#fb7185',
	'#f43f5e',
	'e11d48',
	'#be123c',
	'#9f1239',
	'#881337',
	'#4c0519',
];
const incomeColor: readonly string[] = [
	'#86efac',
	'#4ade80',
	'#22c55e',
	'#16a34a',
	'#15803d',
	'#166534',
	'#14532d',
	'#052e16',
];
const storage = JSON.parse(localStorage.getItem('storage')!);

let details: UserHistory[] = JSON.parse(localStorage.getItem('details')!) || [];
let income: number = JSON.parse(localStorage.getItem('income')!) ?? 0;
let expense: number = JSON.parse(localStorage.getItem('expense')!) ?? 0;

const enum Category {
	EXPENSE = 'expense',
	INCOME = 'income',
}

interface UserHistory {
	id: string;
	category: Category;
	title: string;
	amount: number;
	date: string;
}

function getChart(
	ctx: HTMLCanvasElement,
	details: UserHistory[],
	category: string,
	backgroundColor: readonly string[]
) {
	return new Chart(ctx, {
		type: 'doughnut',
		data: {
			labels: details
				.filter((val) => {
					return val.category == category;
				})
				.map((val) => val.title),
			datasets: [
				{
					label: category,
					data: details
						.filter((val) => {
							return val.category == category;
						})
						.map((val) => val.amount),
					borderWidth: 1,
					backgroundColor: backgroundColor,
				},
			],
		},
		options: {
			scales: {
				y: {
					beginAtZero: true,
				},
			},
		},
	});
}

function generateUUID(): string {
	let d: number = new Date().getTime();
	if (
		typeof performance !== 'undefined' &&
		typeof performance.now === 'function'
	) {
		d += performance.now();
	}
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
		let r: number = (d + Math.random() * 16) % 16 | 0;
		d = Math.floor(d / 16);
		return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
	});
}

function handleDelete(e: ParentNode, id: string): void {
	e.parentElement?.remove();
	details.map((element, idx) => {
		if (element.id === id) {
			details.splice(idx, 1);
			renderGetChart(element.category, -element.amount);
			return;
		}
	});
}

function renderGetChart(category: string, amount: number) {
	if (category === 'expense') {
		expense += amount;
		expenseTrans.innerText = `${expense}`;
		if (myChart.myExpenseChart) {
			(myChart.myExpenseChart as any).destroy();
		}
		myChart.myExpenseChart = getChart(ctx2, details, category, expenseColor);
	} else {
		income += amount;
		incomeTrans.innerText = `${income}`;
		if (myChart.myIncomeChart) {
			(myChart.myIncomeChart as any).destroy();
		}
		myChart.myIncomeChart = getChart(ctx1, details, category, incomeColor);
	}
	balance.innerText = `${income - expense}`;

	localStorage.setItem('details', JSON.stringify(details));
	localStorage.setItem('income', JSON.stringify(income));
	localStorage.setItem('expense', JSON.stringify(expense));
}

const getTransactionDetails = (data: UserHistory) => {
	return transaction.insertAdjacentHTML(
		'afterbegin',
		`<div class="flex items-center w-full p-2 justify-between"> <div class="flex items-center flex-row gap-3"> <i class="fa-solid fa-sack-dollar ${
			data.category === 'expense' ? 'bg-red-500' : 'bg-green-500'
		} p-2.5 rounded-full text-white" ></i> <div class="text-sm"> <p class="capitalize">${
			data.title
		}</p> <div class="flex text-sm gap-2 text-slate-500"> <p class="before:content-['$']">${
			data.amount
		}</p> <p>${
			data.date
		}</p> </div> </div> </div> <i class="fa-solid fa-trash rounded-full hover:bg-slate-200 text-slate-600 p-2.5 cursor-pointer" onclick="handleDelete(this,'${
			data.id
		}')"></i></div>`
	);
};

function handleSubmit(e: Event) {
	e.preventDefault();
	const data: UserHistory = {
		id: generateUUID(),
		category: category.value === 'expense' ? Category.EXPENSE : Category.INCOME,
		title: statement.value,
		amount: amount.valueAsNumber,
		date: date.value,
	};
	details.push(data);
	details.sort((a: UserHistory, b: UserHistory): number => {
		return a.amount - b.amount;
	});
	renderGetChart(data.category, data.amount);
	getTransactionDetails(data);
	form.reset();
}

form.onsubmit = (e) => handleSubmit(e);
renderGetChart('expense', 0);
renderGetChart('income', 0);
details.map((data: UserHistory) => {
	getTransactionDetails(data);
});
