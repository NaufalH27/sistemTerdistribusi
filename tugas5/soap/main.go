package main

import (
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
)

func soapResponse(htmlContent string) string {
	return fmt.Sprintf(
	`<?xml version="1.0"?>
		<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
		<soap:Body>
			<Response>
			<![CDATA[%s]]>
			</Response>
		</soap:Body>
		</soap:Envelope>`, htmlContent)
}

func serveHTML(w http.ResponseWriter, filePath string) {
	data, err := ioutil.ReadFile(filePath)
	if err != nil {
		http.Error(w, "File not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "text/xml; charset=utf-8")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(soapResponse(string(data))))
}

func main() {
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		serveHTML(w, "./html/home.html")
	})

	http.HandleFunc("/sepuluhkb", func(w http.ResponseWriter, r *http.Request) {
		serveHTML(w, "./html/10kb.html")
	})

	http.HandleFunc("/seratuskb", func(w http.ResponseWriter, r *http.Request) {
		serveHTML(w, "./html/100kb.html")
	})

	http.HandleFunc("/satumb", func(w http.ResponseWriter, r *http.Request) {
		serveHTML(w, "./html/1024kb.html")
	})

	http.HandleFunc("/limamb", func(w http.ResponseWriter, r *http.Request) {
		serveHTML(w, "./html/5120kb.html")
	})

	http.HandleFunc("/sepuluhmb", func(w http.ResponseWriter, r *http.Request) {
		serveHTML(w, "./html/10240kb.html")
	})

	fmt.Println("SOAP server listening on :8081")
	log.Fatal(http.ListenAndServe(":8081", nil))
}
