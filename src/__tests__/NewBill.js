import { screen, fireEvent } from "@testing-library/dom"
import firestore from "../app/Firestore.js"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { setLocalStorage } from "../../setup-jest"
import { ROUTES_PATH } from "../constants/routes"
import Router from "../app/Router"

const onNavigate = (pathname) => { document.body.innerHTML = pathname }
setLocalStorage('Employee')
describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then the newBill page should be rendered", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      //to-do write assertion
      expect(screen.getAllByText("Envoyer une note de frais")).toBeTruthy()
    })
  })

  describe("When I am on the newBill page", () => {
    describe("And I upload an image file", () => {
      test("Then the file handler should show a file", () => {
        document.body.innerHTML = NewBillUI()
        const newBill = new NewBill({ document, onNavigate, firestore: firestore, localStorage: window.localStorage })
        const handleChangeFile = jest.fn(() => newBill.handleChangeFile)
        const inputFile = screen.getByTestId("file")
        inputFile.addEventListener("change", handleChangeFile)
        fireEvent.change(inputFile, {
          target: {
            files: [new File(["sample.txt"], "sample.txt", { type: "text/txt" })],
          }
        })
        const numberOfFile = screen.getByTestId("file").files.length
        expect(numberOfFile).toEqual(1)
      })
    })
  })
  describe("When I select a file other than image", () => {
    test("Then the error message should be displayed", async () => {
      document.body.innerHTML = NewBillUI()
      const newBill = new NewBill({ document, onNavigate, firestore: firestore, localStorage: window.localStorage })
      const handleChangeFile = jest.fn(() => newBill.handleChangeFile)
      const inputFile = screen.getByTestId("file")
      inputFile.addEventListener("change", handleChangeFile)
      fireEvent.change(inputFile, {
        target: {
          files: [new File(["sample.txt"], "sample.txt", { type: "text/txt" })],
        }
      })
      expect(handleChangeFile).toBeCalled()
      expect(inputFile.files[0].name).toBe("sample.txt")
      expect(document.querySelector(".wrongFormat").style.display).toBe("block")
    })
  })
  describe("When I am on NewBill Page and submit the form", () => {
    test("Then it should create a new bill", async () => {
      document.body.innerHTML = NewBillUI()
      const newBill = new NewBill({ document, onNavigate, firestore: firestore, localStorage: window.localStorage })
      const submit = screen.getByTestId('form-new-bill')
      const createdBill = {
        name: "createdBill",
        date: "2021-11-22",
        type: "Restaurants et bars",
        amount: 500,
        pct: 20,
        vat: "40",
        fileName: "test.jpg",
        fileUrl: "https://goopics.net/i/t0ebm4"
      }
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e))
      newBill.createBill = (newBill) => newBill
      document.querySelector(`input[data-testid="expense-name"]`).value = createdBill.name
      document.querySelector(`input[data-testid="datepicker"]`).value = createdBill.date
      document.querySelector(`select[data-testid="expense-type"]`).value = createdBill.type
      document.querySelector(`input[data-testid="amount"]`).value = createdBill.amount
      document.querySelector(`input[data-testid="vat"]`).value = createdBill.vat
      document.querySelector(`input[data-testid="pct"]`).value = createdBill.pct
      document.querySelector(`textarea[data-testid="commentary"]`).value = createdBill.commentary
      newBill.fileUrl = createdBill.fileUrl
      newBill.fileName = createdBill.fileName
      submit.addEventListener('click', handleSubmit)
      fireEvent.click(submit)
      expect(handleSubmit).toHaveBeenCalled()
    })
  })

  // test d'intégration GET
  describe("Given I am connected as an employee", () => {
    describe("When I am on NewBill Page", () => {
      test("Then letter icon in vertical layout should be highlighted", () => {
        const pathname = ROUTES_PATH['NewBill'];
        firestore.bills = () => ({ bills, get: jest.fn().mockResolvedValue() });
        Object.defineProperty(window, "location", { value: { hash: pathname } });
        document.body.innerHTML = `<div id="root"></div>`;
        Router()
        expect(screen.getByTestId("icon-mail")).toBeTruthy();
        expect(screen.getByTestId("icon-mail").classList.contains("active-icon")).toBeTruthy();
      })
    })
  })
})