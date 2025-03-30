package com.srdc.messageApplication.models;

import java.sql.Date;

public class User {
    //Member private variables
    private String userName;
    private String name;
    private String surname;
    private Date birthdate;
    private String email;
    private String address;
    private boolean isAdmin;
    private String gender;
    private String password;

    //Constructor
    public User(String userName, String name, String surname,
                Date birthdate, String email,String address, boolean isAdmin,
                String gender, String password) {
        this.userName = userName;
        this.name = name;
        this.surname = surname;
        this.birthdate = birthdate;
        this.email = email;
        this.address = address;
        this.isAdmin = isAdmin;
        this.gender = gender;
        this.password = password;
    }

    //Getters
    public String getuserName() {return userName;}
    public String getName() {return name;}
    public String getSurname() {return surname;}
    public Date getBirthdate() {return birthdate;}
    public String getEmail() {return email;}
    public String getAddress() {return address;}
    public boolean getisAdmin() {return isAdmin;}
    public String getGender() {return gender;}
    public String getPassword() {return password;}

    //Setters
    public void setuserName(String userName) {this.userName = userName;}
    public void setName(String name) {this.name = name;}
    public void setSurname(String surname) {this.surname = surname;}
    public void setBirthdate(Date birthdate) {this.birthdate = birthdate;}
    public void setEmail(String email) {this.email = email;}
    public void setAddress(String address) {this.address = address;}
    public void setisAdmin(boolean isAdmin) {this.isAdmin = isAdmin;}
    public void setGender(String gender) {this.gender = gender;}
    public void setPassword(String password) {this.password = password;}

}

