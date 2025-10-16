package com.example.soap;

import javax.jws.WebMethod;
import javax.jws.WebService;
import javax.xml.ws.Endpoint;

@WebService
public class Main {

    @WebMethod
    public String resent(String message) {
        return message;
    }

    public static void main(String[] args) {
        String address = "http://localhost:8080/ws/resent";
        Endpoint.publish(address, new Main());
        System.out.println("Server running at " + address);
        System.out.println("WSDL: " + address + "?wsdl");
    }
}