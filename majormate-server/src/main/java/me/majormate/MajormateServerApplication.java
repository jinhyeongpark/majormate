package me.majormate;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class MajormateServerApplication {

	public static void main(String[] args) {
		SpringApplication.run(MajormateServerApplication.class, args);
	}

}
