window.addEventListener("DOMContentLoaded", () => {
  fetchData();
});

async function addnewbook() {
  const title = document.getElementById("title").value;
  const author = document.getElementById("author").value;
  const publicationYear = document.getElementById("publicationYear").value;
  const pdfFile = document.getElementById("pdfFile").files[0];

  const formData = new FormData();
  formData.append("title", title);
  formData.append("author", author);
  formData.append("publicationYear", publicationYear);
  formData.append("pdfFile", pdfFile);

  const token = localStorage.getItem("token");

  await axios
    .post("http://localhost:3000/register-book", formData, {
      headers: {
        Authorization: token,
        'Content-Type': 'multipart/form-data'
      },
    })
    .then((response) => {
      console.log(response.data);
    })
    .catch((errr) => {
      console.log(errr);
    });
}

async function fetchData() {
  const token = localStorage.getItem("token");

  const bookDropdown = document.getElementById("books-per-page");
  const filterDropdown = document.getElementById("books-filter");
  bookDropdown.value = parseInt(localStorage.getItem("itemPerPage"));
  filterDropdown.value = localStorage.getItem("booksFilter");

  try {
    fetchBooksAndPopulate(
      1,
      localStorage.getItem("itemPerPage") || 2,
      localStorage.getItem("booksFilter") || "id"
    );

    bookDropdown.addEventListener("change", () => {
      const newItemsPerPage = parseInt(bookDropdown.value);
      localStorage.setItem("itemPerPage", bookDropdown.value);
      fetchBooksAndPopulate(
        1,
        newItemsPerPage,
        localStorage.getItem("booksFilter")
      );
    });
    filterDropdown.addEventListener("change", () => {
      localStorage.setItem("booksFilter", filterDropdown.value);
      fetchBooksAndPopulate(
        1,
        localStorage.getItem("itemPerPage"),
        filterDropdown.value
      );
    });
  } catch (error) {
    console.error("Error fetching books:", error);
  }
}

async function fetchBooks(page, itemsPerPage, filterValue, token) {
  const url = `http://localhost:3000/books?page=${page}&limit=${itemsPerPage}&sortBy=${filterValue}`;
  const results = await axios.get(url, {
    headers: { Authorization: token },
  });
  return results;
}

function updateTable(data) {
  let elem1 = document.getElementById("bookTable");
  while (elem1.firstChild) {
    elem1.removeChild(elem1.firstChild);
  }
  for (let i = 0; i < data.length; i++) {
    addBookToTable(data[i]);
  }
}

function generatePagination(
  containerId,
  totalItems,
  itemsPerPage,
  onPageChange
) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  for (let i = 1; i <= totalPages; i++) {
    const button = document.createElement("button");
    button.innerText = i;
    button.addEventListener("click", () =>
      onPageChange(i, itemsPerPage, localStorage.getItem("booksFilter") || "id")
    );
    container.appendChild(button);
  }
}

async function fetchBooksAndPopulate(page, itemsPerPage, filterValue) {
  const token = localStorage.getItem("token");
  const results = await fetchBooks(page, itemsPerPage, filterValue, token);

  const dataToDisplay =
    results.data.allBooks.length < itemsPerPage
      ? results.data.allBooks
      : results.data.allBooks.slice(0, itemsPerPage);

  updateTable(dataToDisplay);
  generatePagination(
    "pagination",
    results.data.totalCount,
    itemsPerPage,
    handleBooksPageChange
  );
}

function handleBooksPageChange(pageNumber, itemsPerPage, filterValue) {
  fetchBooksAndPopulate(pageNumber, itemsPerPage, filterValue);
}

function addBookToTable(book) {
  const { title, author, publicationYear, pdfUrl, id } = book;

  const tableBody = document.getElementById("bookTable");
  const tableRow = document.createElement("tr");

  const titleCell = createTableCell(title);
  const authorCell = createTableCell(author);
  const publicationYearCell = createTableCell(publicationYear);

  const pdfLinkCell = document.createElement("td");
  const pdfLink = document.createElement("a");
  pdfLink.href = pdfUrl;
  pdfLink.textContent = "View PDF";
  pdfLink.target = "_blank";
  pdfLinkCell.appendChild(pdfLink);

  tableRow.appendChild(titleCell);
  tableRow.appendChild(authorCell);
  tableRow.appendChild(publicationYearCell);
  tableRow.appendChild(pdfLinkCell);

  const deleteButton = createButton("Delete", "btn btn-outline-danger");
  deleteButton.addEventListener("click", () => removeBook(id));
  tableRow.appendChild(deleteButton);

  const editButton = createButton("Edit", "btn btn-outline-primary");
  editButton.addEventListener("click", () => editBook(id));
  tableRow.appendChild(editButton);

  tableBody.appendChild(tableRow);
}
