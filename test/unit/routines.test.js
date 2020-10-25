/**
 *
 * Author:  Jhoan Esneyder Peña
 * Email: esneideramy@gmail.com
 *
 * License: MIT - Copyright (c) Jhoan Esneyder Peña
 * @link 
 *
 */
const { expect } = require('code');
const lab = require('lab').script();
exports.lab = lab;
const { test, suite, beforeEach } = lab;

const routines = require('../../routines/routines');

/** Set this flag to true if you want to print the updated document after each test */
let print_updated_doc = false;

suite('[test][generateUpdateStatement]', () => {
	
	let doc;
	let outputs;

	beforeEach(function () {
		// The dummy data of the document that is going to be modified
		doc = require('../../models/doc-model').get();
	});

	test('Individual items in subdocument should be added', async() => {

		let mutations = [
			{"posts": [{"_id": 3, "mentions": [{"text": "banana"}]}]},
			{"posts": [{"value": "four"}] },
		];

		
		mutations.forEach(mutation => {
			outputs = routines.generateUpdateStatement(doc, mutation);
			console.log(JSON.stringify(outputs, null, 2));
			
			expect(outputs).to.be.a.object();
			expect(outputs).to.contain('$add');
		});

		if(print_updated_doc)
			console.log(JSON.stringify(doc, null, 2));
		
	});

	test('Individual items in subdocument should be updated', async() => {

		let mutations = [
			{ "posts": [{"_id": 3, "mentions": [ {"_id": 5, "text": "pear"}]}] },
			{ "posts": [{"_id": 2, "value": "too"}] },
		];

		mutations.forEach(mutation => {
			outputs = routines.generateUpdateStatement(doc, mutation);
			console.log(JSON.stringify(outputs, null, 2));
			
			expect(outputs).to.be.a.object();
			expect(outputs).to.contain('$update');
		});

		if(print_updated_doc)
			console.log(JSON.stringify(doc, null, 2));
	});

	test('Individual items in subdocument should be deleted', async() => {

		let mutations = [
			{ "posts": [{"_id": 2, "_delete": true}] },
			{ "posts": [{"_id": 3, "mentions": [{"_id": 6, "_delete": true}]}]},
		];

		mutations.forEach(mutation => {
			outputs = routines.generateUpdateStatement(doc, mutation);
			
			console.log(JSON.stringify(outputs, null, 2));
			expect(outputs).to.be.a.object();
			expect(outputs).to.contain('$remove');
		});

		if(print_updated_doc)
			console.log(JSON.stringify(doc, null, 2));
		
	});

	test('Update, Add and Remove in single statement', async() => {

		let mutations = 
		{
			"posts": [
				{"_id": 3, "value": "third"},					
				{"value": "six"},
				{"_id": 4, "_delete": true}
			]
		};
		
		outputs = routines.generateUpdateStatement(doc, mutations);
		console.log(JSON.stringify(outputs, null, 2));

		expect(outputs).to.be.a.object();
		expect(outputs).to.contain('$add');
		expect(outputs).to.contain('$update');
		expect(outputs).to.contain('$remove');

		if(print_updated_doc)
			console.log(JSON.stringify(doc, null, 2));
	});

	test('Mutations with invalid paths', async() => {

		let mutations = [
			{ "posts": [{"_id": 12, "mentions": [{"text": "banana"}]}]},
			{ "posts": [{"_id": 2, "another_array": [ {"_id": 5, "text": "pear"}]}] },
			{ "posts": [{"_id": 12, "_delete": true}] },
		];

		mutations.forEach(mutation => {
			outputs = routines.generateUpdateStatement(doc, mutation);
			console.log(JSON.stringify(outputs, null, 2));
			expect(outputs).to.be.a.object();
		});

		if(print_updated_doc)
			console.log(JSON.stringify(doc, null, 2));
	});

	test('Another supported mutations', async() => {

		let mutations = [
			{
				"posts": [
				{"_id": 2, "value": "too"},
				{"_id": 2, "_delete": true}
				]
			},
			{"posts": [
				{"value": "Eleven", "otherProp": "Another prop"},
				{"_id": 3, "mentions": [{"_id": 7, "_delete": true}, {"text": "banana"}]},
				{"_id": 3, "mentions": [{"text2": "banana2"}, {"text3": "banana3", "text3.1":"banana3.1"}]},
				{"_id": 3, "mentions": [{"_id": 8, "faces": [{"_id": 4, "_delete": true}]}]}
			]}
		];

		mutations.forEach(mutation => {
			outputs = routines.generateUpdateStatement(doc, mutation);
			console.log(JSON.stringify(outputs, null, 2));
			expect(outputs).to.be.a.object();
		});

		if(print_updated_doc)
			console.log(JSON.stringify(doc, null, 2));
	});
});