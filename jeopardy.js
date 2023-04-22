// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]

let categories = [];

/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */

function getCategoryIds() {}

/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */

function getCategory(catId) {}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */

async function fillTable() {
  $('thead').empty();
  $('tbody').empty();
  const categories = await getCat();
  const questions = await getClues(categories);
  $('thead').append('<tr>');
  for (let i = 0; i < 6; i++) {
    $('tr').append(`<th class="head">${categories[i].title}</th>`);
  }
  for (let i = 0; i < 5; i++) {
    $('tbody').append(`<tr id=row${i}>`);
    for (let j = 0; j < 6; j++) {
      $(`#row${i}`).append(
        `<td class="board-td" id=${i}-${j}><div class = "default">?</div><div style="display: none" class="question">${questions[j].clues[i].question}</div><div style="display: none" class="answer">${questions[j].clues[i].answer}</div></td>`
      );
    }
  }

  if ($('tr').get().length > 1) {
    $('header').addClass('loadedGame');
    $('h1').addClass('loadedEl');
    $('#start').addClass('loadedBtn');
    const tds = $('td').get();
    $(tds).on('click', handleClick);

    hideLoadingView();
  }
}

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

function handleClick(evt) {
  const dataCell = $(this);
  const defaultDiv = dataCell.children().get(0);
  const questionDiv = dataCell.children().get(1);
  const answerDiv = dataCell.children().get(3);

  $(defaultDiv).remove();
  $(questionDiv).show(2000);
  $(this).css('background-color', 'red').css('opacity', 1);

  if ($(defaultDiv).hasClass('question')) {
    $(this).css('background-color', 'green').css('opacity', 1);
    $(this).off('click');
  }
}

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */

function showLoadingView() {
  $('#spin-container').toggle();
  $('#start').off('click');
  $('#start').text('Loading...');
  $('#start').attr('disabled', 'disabled').css('color', 'red');
}

/** Remove the loading spinner and update the button used to fetch data. */

function hideLoadingView() {
  $('#spin-container').toggle();
  $('#start').text('Restart game').css('color', 'black').removeAttr('disabled');
  $('#start').on('click', setupAndStart);
}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

async function setupAndStart() {
  showLoadingView();
  fillTable();
}

/** On click of start / restart button, set up game. */

$('#start').on('click', setupAndStart);

/** On page load, add event handler for clicking clues */

// TODO

async function getCat() {
  const cats = await axios.get('http://jservice.io/api/categories?count=20', {
    params: { offset: Math.floor(Math.random() * 2000) },
  });
  const catsData = cats.data;
  const catsArr = catsData.filter((value) => value.clues_count >= 5);
  let top6 = catsArr.slice(0, 6);

  return top6;
}

async function getClues(array) {
  let arr = [];
  for (let items in array) {
    let response = await axios.get('http://jservice.io/api/category?', {
      params: { id: array[items].id },
    });
    arr.push(response);
  }
  const objectData = arr.map((value) => value.data);
  const catObject = objectData.map((value) => {
    return {
      title: value.title,
      clues: value.clues,
    };
  });

  const cluesMap = catObject.map((value) => {
    return value.clues.map((value) => {
      return { question: value.question, answer: value.answer };
    });
  });
  const categoryObject = [];
  for (let i = 0; i < catObject.length; i++) {
    categoryObject.push({ title: catObject[i].title, clues: cluesMap[i] });
  }

  return categoryObject;
}
