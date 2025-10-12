package main

import (
	"encoding/xml"
	"fmt"
	"log"
	"net/http"
)

func main() {
	http.HandleFunc("/hello", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Only POST allowed", http.StatusMethodNotAllowed)
			return
		}

		type Req struct {
			XMLName xml.Name `xml:"Req"`
			Name    string   `xml:"Name"`
		}

		type Res struct {
			XMLName xml.Name `xml:"Res"`
			Message string   `xml:"Message"`
		}

		var req Req
		err := xml.NewDecoder(r.Body).Decode(&req)
		if err != nil {
			http.Error(w, "Invalid XML", http.StatusBadRequest)
			return
		}

		resp := Res{
			Message: fmt.Sprintf("Hello, %s!", req.Name),
		}

		w.Header().Set("Content-Type", "application/xml")
		err = xml.NewEncoder(w).Encode(resp)
		if err != nil {
			http.Error(w, "Failed to encode response", http.StatusInternalServerError)
			return
		}
	})

	fmt.Println("SOAP-like server running at http://localhost:8080/hello")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
